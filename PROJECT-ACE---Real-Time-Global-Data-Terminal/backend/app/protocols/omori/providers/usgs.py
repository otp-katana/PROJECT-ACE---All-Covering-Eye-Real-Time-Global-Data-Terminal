import httpx
from app.protocols.omori.schemas import SeismicEvent

USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"

async def fetch_usgs_events() -> list[SeismicEvent]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(USGS_URL)
        response.raise_for_status()
        data = response.json()

    events = []
    for feature in data.get("features", []):
        coords = feature["geometry"]["coordinates"]  # [lon, lat, depth]
        props = feature["properties"]
        events.append(SeismicEvent(
            lat=coords[1],
            lon=coords[0],
            mag=props.get("mag", 0.0),
            place=props.get("place"),
            time=str(props.get("time")),
        ))
    return events