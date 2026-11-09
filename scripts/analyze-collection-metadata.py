"""Aggregate collection traits without extracting archives or publishing token metadata."""
import argparse
import collections
import json
import zipfile
from pathlib import Path

EXPECTED = {"bobros": 2222, "floaties": 2222, "groypers": 777}

def analyze(archive, expected):
    traits = collections.defaultdict(collections.Counter)
    names = set()
    ranked = []
    with zipfile.ZipFile(archive) as source:
        files = [entry for entry in source.infolist() if entry.filename.lower().endswith(".json") and not entry.filename.startswith("__MACOSX/")]
        if len(files) != expected:
            raise ValueError(f"Expected {expected} JSON records, found {len(files)}")
        for entry in files:
            if entry.file_size > 2_000_000:
                raise ValueError("Unexpectedly large metadata record")
            item = json.loads(source.read(entry).decode("utf-8-sig"))
            name = item.get("name")
            if not name or name in names:
                raise ValueError("Missing or duplicate token name")
            names.add(name)
            rank = next((a.get("value") for a in item.get("attributes", []) if a.get("trait_type") == "Rarity Rank"), None)
            if isinstance(rank, (int, float)) and rank > 0:
                token_id = Path(entry.filename).stem.removeprefix("nft_")
                ranked.append({"name": name, "tokenId": token_id, "rank": rank})
            seen = set()
            for attribute in item.get("attributes", []):
                category = str(attribute.get("trait_type", "")).strip()
                value = attribute.get("value")
                if not category or category.casefold() == "rarity rank" or value is None:
                    continue
                if category in seen:
                    raise ValueError(f"Duplicate trait category: {category}")
                seen.add(category)
                traits[category][str(value)] += 1
    categories = [{"name": name, "variants": len(values), "coverage": sum(values.values()), "top": [{"value": value, "count": count} for value, count in values.most_common(3)]} for name, values in sorted(traits.items(), key=lambda pair: (-len(pair[1]), pair[0]))]
    return {"tokens": len(names), "categories": len(categories), "variants": sum(item["variants"] for item in categories), "rarest": sorted(ranked, key=lambda item: item["rank"])[:3], "source": "Artist-provided collection metadata", "note": "Rarity Rank is excluded. Variants are distinct category/value pairs, including explicit None values."}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    for key in EXPECTED:
        parser.add_argument("--" + key, required=True)
    parser.add_argument("--out", default="src/data/collection-traits.json")
    args = parser.parse_args()
    result = {key: analyze(getattr(args, key), expected) for key, expected in EXPECTED.items()}
    for key, collection in result.items():
        for item in collection["rarest"]:
            item["src"] = f"/collections/{key}/rare-{item['tokenId']}.webp"
    Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for key, item in result.items():
        print(f"{key}: {item['tokens']} tokens, {item['categories']} categories, {item['variants']} variants")
