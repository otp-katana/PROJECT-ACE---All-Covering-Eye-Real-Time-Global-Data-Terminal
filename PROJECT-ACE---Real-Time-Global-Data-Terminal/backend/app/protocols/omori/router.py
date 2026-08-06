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