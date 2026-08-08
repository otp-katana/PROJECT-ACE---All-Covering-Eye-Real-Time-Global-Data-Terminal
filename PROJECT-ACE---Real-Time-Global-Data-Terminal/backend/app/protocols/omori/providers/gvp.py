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
            continue  # koordinatı olmayan kaydı atla

        coords = geometry["coordinates"]
        if coords[0] is None or coords[1] is None:
            continue  # bozuk koordinatı atla

        props = feature.get("properties", {})
        volcanoes.append(SeismicEvent(
            lat=coords[1],
            lon=coords[0],
            mag=4.0,
            place=props.get("VolcanoName"),
            time=None,
            last_eruption=props.get("LastEruption"),
        ))
    return volcanoes