from pydantic import BaseModel

class SeismicEvent(BaseModel):
    lat: float
    lon: float
    mag: float
    place: str | None = None
    time: str | None = None