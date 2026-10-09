"""Check that every app slug used by an alternative has a file in apps/."""
import pathlib
import sys

import yaml

root = pathlib.Path(__file__).resolve().parent.parent
apps = {p.stem for p in (root / "apps").glob("*.yml")}
errors = []

for path in sorted((root / "alternatives").glob("*.yml")):
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    for slug in data.get("replaces", []):
        if slug not in apps:
            errors.append(f"{path.name}: replaces unknown app '{slug}'")
    for slug in data.get("parity", {}):
        if slug not in data.get("replaces", []):
            errors.append(f"{path.name}: parity score for '{slug}' but it is not in replaces")

if errors:
    print("\n".join(errors))
    sys.exit(1)
print("References OK")
