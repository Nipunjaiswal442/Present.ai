import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import JSONResponse

from api.v1.auth.users import read_user_from_cookie
from models.sql.user import User
from services.database import get_async_session
from services.presenton_cloud import get_presenton_provider, has_cloud_credentials
from services.provider_settings import get_effective_provider_settings
from utils.get_env import (
    get_can_change_keys_env,
    get_presenton_oauth_issuer,
    is_disable_auth_enabled,
)

RUNTIME_CONFIG_ROUTER = APIRouter()
# Do not redact numeric settings such as LLM_MAX_OUTPUT_TOKENS.
SECRET_FIELD = re.compile(r"API_KEY|ACCESS_KEY|SECRET|PASSWORD|(?:^|_)TOKEN(?:$|_)", re.I)


def redact_provider_settings(config: dict) -> dict:
    return {
        key: ("__configured__" if value else "") if SECRET_FIELD.search(key) else value
        for key, value in config.items()
    }


@RUNTIME_CONFIG_ROUTER.get("/runtime-config")
async def runtime_config(
    session: AsyncSession = Depends(get_async_session),
    user: User | None = Depends(read_user_from_cookie),
):
    if user is None and not is_disable_auth_enabled():
        raise HTTPException(status_code=401, detail="Unauthorized")
    config = await get_effective_provider_settings(session)
    provider = await get_presenton_provider(session, get_presenton_oauth_issuer())
    config["PRESENTON_CONNECTED"] = has_cloud_credentials(provider)
    return JSONResponse(
        {
            "config": redact_provider_settings(config),
            "canChange": get_can_change_keys_env() != "false"
            and (is_disable_auth_enabled() or bool(user and user.is_superuser)),
        },
        headers={"Cache-Control": "no-store"},
    )
