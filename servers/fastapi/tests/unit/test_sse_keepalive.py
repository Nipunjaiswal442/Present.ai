import asyncio
import logging

from utils.sse import safe_sse_stream


def test_slow_generation_keeps_connection_alive_without_restarting_model():
    async def run():
        calls = 0
        ready = asyncio.Event()

        async def slow_model():
            nonlocal calls
            calls += 1
            await ready.wait()
            yield "event: response\ndata: complete\n\n"

        stream = safe_sse_stream(slow_model(), logger=logging.getLogger(__name__), error_detail="failed", heartbeat_seconds=0.01)
        assert await anext(stream) == ": keep-alive\n\n"
        assert await anext(stream) == ": keep-alive\n\n"
        ready.set()
        assert await anext(stream) == "event: response\ndata: complete\n\n"
        assert [chunk async for chunk in stream] == []
        assert calls == 1

    asyncio.run(run())


def test_closing_connection_cancels_pending_model_work():
    async def run():
        closed = asyncio.Event()

        async def slow_model():
            try:
                await asyncio.Event().wait()
                yield "unreachable"
            finally:
                closed.set()

        stream = safe_sse_stream(slow_model(), logger=logging.getLogger(__name__), error_detail="failed", heartbeat_seconds=0.01)
        await anext(stream)
        await stream.aclose()
        assert closed.is_set()

    asyncio.run(run())
