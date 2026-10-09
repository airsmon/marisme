"""Refresh card snapshots explicitly: python3 scripts/update-github-metadata.py.

Uses HUGO_GITHUB_TOKEN when available. A failed request leaves the snapshot intact.
"""

import json
import os
from pathlib import Path
import re
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]


def main():
    repos = set()
    for page in (ROOT / "content").rglob("*.md"):
        for shortcode in re.findall(r"{{[<%]\s*github\b(.*?)[>%]}}", page.read_text(), re.S):
            attrs = dict(re.findall(r'(\w+)="([^"]*)"', shortcode))
            repo = attrs.get("repo")
            if not repo and attrs.get("owner") and attrs.get("name"):
                repo = f'{attrs["owner"]}/{attrs["name"]}'
            if repo:
                if not re.fullmatch(r"[\w.-]+/[\w.-]+", repo):
                    raise ValueError(f"Invalid repository: {repo}")
                repos.add(repo)

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "marisme-metadata",
    }
    if token := os.environ.get("HUGO_GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {token}"

    snapshot = {}
    for repo in sorted(repos, key=str.lower):
        with urlopen(Request(f"https://api.github.com/repos/{repo}", headers=headers), timeout=20) as response:
            data = json.load(response)
        snapshot[repo.lower()] = {key: data.get(key) for key in (
            "html_url", "description", "language", "stargazers_count", "topics",
        )}
        license_data = data.get("license")
        snapshot[repo.lower()]["license"] = {"spdx_id": license_data["spdx_id"]} if license_data else None

    target = ROOT / "data/github.json"
    temporary = target.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(target)
    print(f"Updated {len(snapshot)} repository snapshots in data/github.json")


if __name__ == "__main__":
    main()
