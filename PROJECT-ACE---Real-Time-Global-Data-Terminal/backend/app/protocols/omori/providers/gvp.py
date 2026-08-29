
# ───────────────────────────────────────────────────────────────────────────
# ── PART: 1 ][ GVP PROVIDER ────────────────────────────────────────────────
# ───────────────────────────────────────────────────────────────────────────
# Fetches Holocene-era volcano data from the Smithsonian Global Volcanism...
# ...Program's live WFS/GeoServer endpoint (not a static download — queried...
# ...fresh on each request). Returns ~1200 volcanoes worldwide.
#
# Field mapping notes (discovered by inspecting a live response, since the...
# ...GVP API is undocumented for third-party use):
#       - Property keys are camelCase: "VolcanoName", "LastEruption", etc.
#       - "mag" has no real equivalent in volcano data — GVP does not report...
#        ...eruption magnitude the way USGS reports earthquake magnitude. A fixed...
#        ...value (4.0) is used so the shared SeismicEvent schema's mag-based...
#        ...visual scaling (see useGlobe.js) doesn't break for volcanoes.
#       - Some records have null/missing coordinates and are skipped.
import httpx

from app.protocols.omori.schemas import SeismicEvent

GVP_URL = (
    "https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows"
    "?service=WFS&version=2.0.0&request=GetFeature"
    "&typeName=GVP-VOTW:E3WebApp_HoloceneVolcanoes"
    "&outputFormat=application/json"
)


async def fetch_gvp_volcanoes() -> list[SeismicEvent]:
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(GVP_URL)
        response.raise_for_status()
        data = response.json()

    volcanoes = []
    for feature in data.get("features", []):
        geometry = feature.get("geometry")
        if not geometry or "coordinates" not in geometry:
            continue    # Skip records with no geometry at all

        coords = geometry["coordinates"]
        if coords[0] is None or coords[1] is None:
            continue    # Skip records with null lat/lon

        props = feature.get("properties", {})
        volcanoes.append(
            SeismicEvent(
                lat=coords[1],
                lon=coords[0],
                mag=4.0,    # placeholder — see module note above
                place=props.get("VolcanoName"),
                time=None,
                last_eruption=props.get("LastEruption"),
            )
        )
    return volcanoes
