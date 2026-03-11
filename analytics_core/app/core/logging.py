import logging

try:
    import structlog
except ModuleNotFoundError:  # pragma: no cover - fallback for minimal environments
    structlog = None  # type: ignore[assignment]


def configure_logging() -> None:
    logging.basicConfig(
        format="%(message)s",
        level=logging.INFO,
    )

    if structlog is None:
        return

    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.add_log_level,
            structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str):
    if structlog is None:
        return logging.getLogger(name)
    return structlog.get_logger(name)