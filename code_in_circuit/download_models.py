import asyncio
import httpx
from pathlib import Path
import json

VERSION_URL = "https://huggingface.co/QThang26/TomatoBuddy/resolve/main/version.json"
MODEL_BASE_URL = "https://huggingface.co/QThang26/TomatoBuddy/resolve/main/"
MODEL_DIR = Path("models")

MODEL_DIR.mkdir(exist_ok=True)

async def fetch_version_info():
    async with httpx.AsyncClient(follow_redirects=True) as client:
        res = await client.get(VERSION_URL)
        res.raise_for_status()
        return res.json()

def get_local_version(model_name: str) -> str | None:
    version_file = MODEL_DIR / f"{model_name}.version"
    if version_file.exists():
        return version_file.read_text().strip()
    return None

def save_local_version(model_name: str, version: str):
    version_file = MODEL_DIR / f"{model_name}.version"
    version_file.write_text(version)

async def download_model(model_name: str, version: str, filename: str):
    model_path = MODEL_DIR / filename
    model_url = f"{MODEL_BASE_URL}{filename}"

    print(f"Downloading model '{model_name}' version {version}...")

    async with httpx.AsyncClient(follow_redirects=True) as client:
        res = await client.get(model_url)
        res.raise_for_status()
        model_path.write_bytes(res.content)

    save_local_version(model_name, version)
    print(f"Model '{model_name}' downloaded and saved to '{model_path}'")

async def check_and_update_model(model_name: str, info: dict):
    latest_version = info["version"]
    filename = info["filename"]
    current_version = get_local_version(model_name)

    if current_version == latest_version:
        print(f"Model '{model_name}' is up to date (version {current_version})")
    else:
        await download_model(model_name, latest_version, filename)

async def main():
    version_info = await fetch_version_info()
    tasks = []

    for model_name, info in version_info.items():
        tasks.append(check_and_update_model(model_name, info))

    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
