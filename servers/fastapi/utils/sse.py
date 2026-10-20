import asyncio
import logging
from contextlib import suppress
from collections.abc import AsyncGenerator, AsyncIterator, Awaitable, Callable

from fastapi import HTTPException

from models.sse_response import SSEErrorResponse


async def safe_sse_stream(
    stream: AsyncIterator[str],
    *,
    logger: logging.Logger,
    error_detail: str,
    on_error: Callable[[], Awaitable[None]] | None = None,
    error_metadata: Callable[[Exception], Awaitable[dict[str, object]]] | None = None,
    heartbeat_seconds: float = 15,
) -> AsyncGenerator[str, None]:
    iterator = stream.__aiter__()
    pending: asyncio.Task | None = None
    try:
        while True:
            if pending is None:
                pending = asyncio.create_task(anext(iterator))
            done, _ = await asyncio.wait({pending}, timeout=heartbeat_seconds)
            if not done:
                # Long model calls can be silent for minutes. Keep reverse
                # proxies alive without cancelling or restarting generation.
                yield ": keep-alive\n\n"
                continue
            try:
                chunk = pending.result()
            except StopAsyncIteration:
                break
            pending = None
            yield chunk
    except asyncio.CancelledError:
        logger.info("SSE stream cancelled by client")
        return
    except Exception as exc:
        logger.exception("SSE stream failed after response started")
        if on_error:
            try:
                await on_error()
            except Exception:
                logger.exception("SSE stream error cleanup failed")
        detail = exc.detail if isinstance(exc, HTTPException) else error_detail
        metadata: dict[str, object] = {}
        if error_metadata:
            try:
                metadata = await error_metadata(exc)
            except Exception:
                logger.exception("SSE stream error metadata lookup failed")
        yield SSEErrorResponse(detail=str(detail), **metadata).to_string()
    finally:
        if pending is not None:
            if not pending.done():
                pending.cancel()
            with suppress(asyncio.CancelledError, Exception):
                await pending
        close = getattr(iterator, "aclose", None)
        if close:
            with suppress(asyncio.CancelledError, Exception):
                await close()
