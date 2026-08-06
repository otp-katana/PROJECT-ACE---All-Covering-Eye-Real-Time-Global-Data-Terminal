from app.protocols.omori.providers.usgs import fetch_usgs_events
from app.protocols.omori.providers.gvp import fetch_gvp_volcanoes
from app.protocols.omori.schemas import SeismicEvent

async def get_seismic_events() -> list[SeismicEvent]:
    return await fetch_usgs_events()

async def get_volcanic_events() -> list[SeismicEvent]:
    return await fetch_gvp_volcanoes()