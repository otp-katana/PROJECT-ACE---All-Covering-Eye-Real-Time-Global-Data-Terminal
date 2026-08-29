
# ───────────────────────────────────────────────────────────────────────────
# ── PART: 1 ][ OMORI SERVICE LAYER ─────────────────────────────────────────
# ───────────────────────────────────────────────────────────────────────────
# Thin orchestration layer between the router and the data providers.
# Currently each function just delegates to a single provider (USGS or...
# ...VP) — this indirection exists so that, when a second seismic source...
# ...(e.g. EMSC or Kandilli) is added, merging/prioritizing multiple sources...
# ...happens here without changing the router or the providers themselves.
from app.protocols.omori.providers.usgs import fetch_usgs_events
from app.protocols.omori.providers.gvp import fetch_gvp_volcanoes
from app.protocols.omori.schemas import SeismicEvent


async def get_seismic_events() -> list[SeismicEvent]:
    return await fetch_usgs_events()


async def get_volcanic_events() -> list[SeismicEvent]:
    return await fetch_gvp_volcanoes()
