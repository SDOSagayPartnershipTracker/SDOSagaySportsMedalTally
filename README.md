# SDO Sagay City Sports Medal Tally

A view-only GitHub Pages website using the supplied sports background.

## Publish
Settings → Pages → Deploy from a branch → main → /(root) → Save.

## Data connection
The Excel connection is not configured yet. The website deliberately shows dashes until a verified feed is available. It checks `data/standings.json` every minute. Never place workbook credentials, signed flow URLs, director emails or raw submissions in this public repository.

A future Power Automate connection should publish aggregate confirmed medal counts to the JSON file. The schema is `{ "connected": true, "updatedAt": "ISO-8601 timestamp", "records": [{ "cluster": "Cluster 1", "level": "Secondary", "gender": "Boys", "sport": "Basketball (5x5)", "medal": "Gold", "count": 1 }] }`. This is a schema example, not actual results.

Only Confirmed rows count. Normalize × to x in sports. Exclude Para Games. Count each team award once, deduplicate repeated ResultKey values, and keep distinct awards. Rankings compare Gold, Silver, then Bronze; equal counts share a rank.

No build or dependencies are needed. All paths are relative so the site works at a repository subpath.
