import asyncio

from models.sql.user import User
from services.provider_settings import (
    merge_provider_settings,
    migrate_provider_settings_from_file,
    sanitize_provider_settings,
)
from utils.user_config_store import read_user_config_file, update_user_config_file


class ProviderSettingsSession:
    def __init__(self):
        self.row = None

    async def get(self, _model, _key):
        return self.row

    def add(self, row):
        self.row = row

    async def commit(self):
        return None

    async def refresh(self, _row):
        return None


def test_user_table_has_username_and_no_email_column():
    columns = set(User.__table__.columns.keys())

    assert "username" in columns
    assert "email" not in columns


def test_provider_settings_exclude_all_legacy_auth_fields():
    assert sanitize_provider_settings(
        {
            "LLM": "openai",
            "AUTH_USERNAME": "admin",
            "AUTH_PASSWORD": "plain",
            "AUTH_PASSWORD_HASH": "hash",
            "AUTH_SECRET_KEY": "jwt-secret",
        }
    ) == {"LLM": "openai"}


def test_reset_advanced_settings_removes_only_optional_overrides():
    existing = {
        "LLM": "openrouter",
        "OPENROUTER_API_KEY": "key",
        "OPENROUTER_MODEL": "openai/gpt-4o",
        "LLM_MAX_OUTPUT_TOKENS": 65536,
        "LLM_REASONING_MODE": "enabled",
        "OPENROUTER_PROVIDER_ORDER": ["groq"],
    }

    merged = merge_provider_settings(
        existing,
        {
            "LLM_MAX_OUTPUT_TOKENS": "",
            "LLM_REASONING_MODE": "",
            "OPENROUTER_PROVIDER_ORDER": [],
        },
    )

    assert merged == {
        "LLM": "openrouter",
        "OPENROUTER_API_KEY": "key",
        "OPENROUTER_MODEL": "openai/gpt-4o",
    }


def test_startup_migrates_user_config_and_rewrites_compatibility_file(
    monkeypatch, tmp_path
):
    path = tmp_path / "userConfig.json"
    monkeypatch.setenv("USER_CONFIG_PATH", str(path))
    update_user_config_file(
        str(path),
        lambda _: {
            "AUTH_USERNAME": "admin",
            "AUTH_PASSWORD_HASH": "legacy-hash",
            "AUTH_SECRET_KEY": "jwt-secret",
            "LLM": "openai",
            "OPENAI_API_KEY": "provider-key",
        },
    )
    session = ProviderSettingsSession()

    migrated = asyncio.run(migrate_provider_settings_from_file(session))

    assert migrated == {
        "LLM": "openai",
        "OPENAI_API_KEY": "provider-key",
    }
    assert session.row.config == migrated
    assert read_user_config_file(str(path)) == {
        "LLM": "openai",
        "OPENAI_API_KEY": "provider-key",
        "AUTH_USERNAME": "admin",
        "AUTH_PASSWORD_HASH": "legacy-hash",
        "AUTH_SECRET_KEY": "jwt-secret",
    }


def test_keys_are_trimmed_and_redacted_values_do_not_replace_saved_keys():
    merged = merge_provider_settings(
        {"OPENAI_API_KEY": "saved-key"},
        {"OPENAI_API_KEY": "__configured__", "GOOGLE_API_KEY": "  pasted-key\n"},
    )
    assert merged["OPENAI_API_KEY"] == "saved-key"
    assert merged["GOOGLE_API_KEY"] == "pasted-key"


def test_database_settings_apply_without_a_shared_config_file(monkeypatch):
    from utils.user_config import get_user_config, update_env_with_user_config
    monkeypatch.delenv("USER_CONFIG_PATH", raising=False)
    monkeypatch.setenv("OPENAI_API_KEY", "old-key")
    monkeypatch.setenv("LLM", "openai")
    monkeypatch.setenv("OPENAI_MODEL", "old-model")
    update_env_with_user_config({"LLM": "openai", "OPENAI_API_KEY": "new-key", "OPENAI_MODEL": "new-model"})
    config = get_user_config()
    assert config.OPENAI_API_KEY == "new-key"
    assert config.OPENAI_MODEL == "new-model"
    update_env_with_user_config({"OPENAI_API_KEY": ""})
    assert get_user_config().OPENAI_API_KEY is None


def test_empty_first_run_file_preserves_environment_provider(monkeypatch, tmp_path):
    from utils.user_config import get_user_config, update_env_with_user_config
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "empty.json"))
    monkeypatch.setenv("LLM", "openai")
    monkeypatch.setenv("OPENAI_API_KEY", "environment-key")
    update_env_with_user_config({})
    assert get_user_config().LLM == "openai"
    assert get_user_config().OPENAI_API_KEY == "environment-key"


def test_runtime_redaction_preserves_numeric_token_limits():
    from api.v1.auth.runtime_config import redact_provider_settings
    config = redact_provider_settings({
        "OPENAI_API_KEY": "secret", "CODEX_REFRESH_TOKEN": "secret-token",
        "BEDROCK_AWS_SECRET_ACCESS_KEY": "secret", "LLM_MAX_OUTPUT_TOKENS": 4096,
        "LLM_REASONING_BUDGET_TOKENS": 512, "DISABLE_IMAGE_GENERATION": True,
    })
    assert config["OPENAI_API_KEY"] == "__configured__"
    assert config["CODEX_REFRESH_TOKEN"] == "__configured__"
    assert config["BEDROCK_AWS_SECRET_ACCESS_KEY"] == "__configured__"
    assert config["LLM_MAX_OUTPUT_TOKENS"] == 4096
    assert config["LLM_REASONING_BUDGET_TOKENS"] == 512
    assert config["DISABLE_IMAGE_GENERATION"] is True
