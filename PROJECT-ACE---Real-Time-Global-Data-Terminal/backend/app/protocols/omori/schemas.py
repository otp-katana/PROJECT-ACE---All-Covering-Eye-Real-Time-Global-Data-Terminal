
# ─────────────────────────────────────────────────────────────────────────
# ── PART: 1 ][ SEISMIC EVENT SCHEMA ─────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────
# Shared response model for both earthquake and volcano endpoints (see...
# ...router.py). Earthquake-specific fields (depth, updated, felt, tsunami)...
# ...and volcano-specific fields (last_eruption) are all optional, since each...
# ...data source only populates the fields relevant to it.
from pydantic import BaseModel


class SeismicEvent(BaseModel):
    lat: float
    lon: float
    mag: float
    place: str | None = None
    time: str | None = None

    # Earthquake-only (USGS)
    depth: float | None = None
    updated: str | None = None
    felt: int | None = None
    tsunami: int | None = None

    # Volcano-only (Smithsonian GVP)
    last_eruption: int | None = None
