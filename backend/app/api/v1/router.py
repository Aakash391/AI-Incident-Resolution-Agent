from fastapi import APIRouter

from app.api.v1.incidents import router as incidents_router
from app.api.v1.agent import router as agents_router
from app.api.v1.tools import router as tools_router


api_router = APIRouter(
    prefix="/api/v1"
)

api_router.include_router(
    incidents_router
)
api_router.include_router(
    agents_router
)
api_router.include_router(
    tools_router
)