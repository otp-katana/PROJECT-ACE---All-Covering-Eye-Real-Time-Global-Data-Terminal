
# ─────────────────────────────────────────────────────────────────────────
# ── PART: 1 ][ OMORI ROUTER ──────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────
# HTTP endpoints for the OMORI module. Both endpoints share the SeismicEvent...
# ...schema — it was originally designed for earthquake data but its fields...
# ...(lat, lon, mag, place, time, plus optional depth/updated/felt/tsunami and...
# ...last_eruption) generalize well enough to describe volcanoes too, so it is...
# ...reused rather than duplicated. May be split into separate schemas later...
# ...if the two data types diverge further.
from fastapi import APIRouter
from app.protocols.omori.service import get_seismic_events, get_volcanic_events
from app.protocols.omori.schemas import SeismicEvent

router = APIRouter(prefix="/omori", tags=["omori"])


@router.get("/events", response_model=list[SeismicEvent])
async def list_seismic_events():
    return await get_seismic_events()


@router.get("/volcanoes", response_model=list[SeismicEvent])
async def list_volcanic_events():
    return await get_volcanic_events()
