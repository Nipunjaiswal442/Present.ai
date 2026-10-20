from services.temp_file_service import TempFileService
from services.export_task_service import ExportTaskService


def test_startup_cleanup_handles_directory_symlinks_without_deleting_targets(monkeypatch, tmp_path):
    outside = tmp_path / "keep"
    outside.mkdir()
    (outside / "file.txt").write_text("preserve")
    temporary = tmp_path / "temporary"
    (temporary / "browser" / "Versions").mkdir(parents=True)
    (temporary / "browser" / "Versions" / "Current").symlink_to(outside)
    monkeypatch.setenv("TEMP_DIRECTORY", str(temporary))
    service = TempFileService()
    assert list(temporary.iterdir()) == []
    assert (outside / "file.txt").read_text() == "preserve"
    assert service.base_dir == str(temporary)


def test_browser_cache_survives_temporary_directory_cleanup(monkeypatch, tmp_path):
    monkeypatch.setenv("APP_DATA_DIRECTORY", str(tmp_path / "data"))
    monkeypatch.setenv("TEMP_DIRECTORY", str(tmp_path / "temp"))
    monkeypatch.delenv("PUPPETEER_CACHE_DIR", raising=False)
    env = ExportTaskService()._build_node_env()
    assert env["PUPPETEER_CACHE_DIR"] == str(tmp_path / "data" / "cache" / "puppeteer")
