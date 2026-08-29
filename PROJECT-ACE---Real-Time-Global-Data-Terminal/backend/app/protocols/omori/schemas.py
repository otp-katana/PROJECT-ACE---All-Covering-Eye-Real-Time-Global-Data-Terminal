
# ───────────────────────────────────────────────────────────────────────────
# ── PART: 1 ][ SEISMIC EVENT SCHEMA ────────────────────────────────────────
# ───────────────────────────────────────────────────────────────────────────
# Shared response model for both earthquake and volcano endpoints (see...
# ...router.py). Earthquake-specific fields (depth, updated, felt, tsunami)...
# ...and volcano-specific fields (last_eruption) are all optional, since each...
# ...data source only populates the fields relevant to it.
from pydantic import BaseModel, Field


class SeismicEvent(BaseModel):
    lat: float = Field(..., description="Latitude in decimal degrees")
    lon: float = Field(..., description="Longitude in decimal degrees")
    mag: float = Field(..., description="Magnitude (earthquakes: real; volcanoes: placeholder, see gvp.py)")
    place: str | None = None
    time: str | None = Field(None, description="Epoch milliseconds as string")

    # Earthquake-only (USGS)
    depth: float | None = Field(None, description="Depth in kilometers")
    updated: str | None = None
    felt: int | None = Field(None, description="Number of felt reports")
    tsunami: int | None = Field(None, description="1 if tsunami warning issued, else 0")

    # Volcano-only (Smithsonian GVP)
    last_eruption: int | None = Field(None, description="Year of last eruption (negative = BCE)")
