from utils.export_utils import export_download_url


def test_export_url_supports_custom_data_mount_and_encodes_filename(tmp_path, monkeypatch):
    root = tmp_path / "persistent-data"
    monkeypatch.setenv("APP_DATA_DIRECTORY", str(root))
    file = root / "exports" / "users" / "42" / "A plan #1.pptx"
    assert export_download_url(str(file)) == "/app_data/exports/users/42/A%20plan%20%231.pptx"


def test_export_url_rejects_paths_outside_exports(tmp_path, monkeypatch):
    monkeypatch.setenv("APP_DATA_DIRECTORY", str(tmp_path))
    assert export_download_url(str(tmp_path / "config.json")) is None
    assert export_download_url(str(tmp_path / "exports" / ".." / "config.json")) is None


def test_export_url_rejects_symlink_escape(tmp_path, monkeypatch):
    root = tmp_path / "data"
    (root / "exports").mkdir(parents=True)
    (root / "exports" / "external").symlink_to(tmp_path)
    monkeypatch.setenv("APP_DATA_DIRECTORY", str(root))
    assert export_download_url(str(root / "exports" / "external" / "secret.txt")) is None
