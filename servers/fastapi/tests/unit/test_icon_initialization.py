import asyncio
import threading
from unittest.mock import Mock

from services.icon_finder_service import IconFinderService


def test_slow_icon_initialization_does_not_freeze_requests_and_is_shared(monkeypatch):
    service = IconFinderService()
    release = threading.Event()
    calls = 0

    def initialize():
        nonlocal calls
        calls += 1
        release.wait(timeout=2)
        service.vectorstore = Mock(search=Mock(return_value=[]))
        return True

    monkeypatch.setattr(service, "ensure_initialized", initialize)
    monkeypatch.setattr("services.icon_finder_service.ICON_INITIALIZATION_TIMEOUT_SECONDS", 0.01)

    async def run():
        try:
            results = await asyncio.gather(service.search_icons("tree"), service.search_icons("leaf"))
            assert results == [[], []]
            assert not release.is_set()
            assert calls == 1
        finally:
            release.set()
        await service._initialization_task
        await service.search_icons("tree")
        service.vectorstore.search.assert_called_once_with("tree", 1)

    asyncio.run(run())
