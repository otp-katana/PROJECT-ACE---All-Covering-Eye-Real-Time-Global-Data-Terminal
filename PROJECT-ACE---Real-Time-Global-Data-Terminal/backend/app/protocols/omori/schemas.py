from pydantic import BaseModel


class SeismicEvent(BaseModel):
    lat: float
    lon: float
    mag: float
    place: str | None = None
    time: str | None = None
    depth: float | None = None
    updated: str | None = None
    felt: int | None = None
    tsunami: int | None = None
    last_eruption: int | None = None
