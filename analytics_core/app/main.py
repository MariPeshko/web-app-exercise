from fastapi import FastAPI
from fastapi.responses import FileResponse, RedirectResponse

from app.api.routes_events import router as events_router
from app.api.routes_export import router as export_router
from app.api.routes_kpis import router as kpis_router
from app.api.routes_realtime import router as realtime_router
from app.api.routes_timeseries import router as ts_router
from app.core.config import settings
from app.core.logging import configure_logging

configure_logging()

app = FastAPI(title="Analytics Service", version=settings.APP_VERSION)

app.include_router(events_router, prefix=settings.API_PREFIX, tags=["events"])
app.include_router(kpis_router, prefix=settings.API_PREFIX, tags=["kpis"])
app.include_router(ts_router, prefix=settings.API_PREFIX, tags=["timeseries"])
app.include_router(export_router, prefix=settings.API_PREFIX, tags=["export"])
app.include_router(realtime_router, prefix=settings.API_PREFIX, tags=["realtime"])


@app.get("/health", tags=["health"])
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def index() -> RedirectResponse:
    return RedirectResponse(url="/dashboard")


@app.get("/dashboard", include_in_schema=False)
def dashboard() -> FileResponse:
    return FileResponse("app/static/dashboard.html")