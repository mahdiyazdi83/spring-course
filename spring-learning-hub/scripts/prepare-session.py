"""Create bounded, source-preserving reading packets from one completed ASR recording.

Standard library only. No model calls, summarization, or automatic coverage claims.
"""

import argparse
import hashlib
import json
import math
from pathlib import Path


def prepare(source, output, limit=12000):
    if limit < 1000:
        raise ValueError("max-chars must be at least 1000")
    manifest_path = source / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("complete") is not True:
        raise ValueError("Recording transcription is incomplete")
    files = sorted(source.glob("chunk-*.jsonl"))
    if not files:
        raise ValueError("No chunk JSONL files found")
    digest = hashlib.sha256(f"packets-v1:{limit}".encode())
    digest.update(str(source.resolve()).encode())
    digest.update(manifest_path.read_bytes())
    packets, current, size, count = [], [], 0, 0
    for path in files:
        data = path.read_bytes()
        digest.update(path.name.encode())
        digest.update(data)
        for number, raw in enumerate(data.decode("utf-8-sig").splitlines(), 1):
            if not raw.strip():
                continue
            segment = json.loads(raw)
            start, end, text = segment["start"], segment["end"], segment["text"]
            if not isinstance(text, str) or not all(
                isinstance(t, (int, float)) and math.isfinite(t) for t in (start, end)
            ) or start < 0 or end < start:
                raise ValueError(f"Invalid segment: {path.name}:{number}")
            count += 1
            prefix = f"[{start:.2f}-{end:.2f}s | {path.name}:{number}] "
            # Keep all text, including repetitions: only a human can judge ASR errors.
            width = limit - len(prefix) - 1
            pieces = [text[i:i + width] for i in range(0, len(text), width)] or [""]
            for piece in pieces:
                line = prefix + piece + "\n"
                if current and size + len(line) > limit:
                    packets.append("".join(current))
                    current, size = [], 0
                current.append(line)
                size += len(line)
    if current:
        packets.append("".join(current))
    if not packets:
        raise ValueError("No transcript segments; inspect silent/failed ASR recording")
    destination = output / digest.hexdigest()[:20]
    destination.mkdir(parents=True, exist_ok=True)
    entries = []
    for index, body in enumerate(packets, 1):
        name = f"packet-{index:03d}.txt"
        (destination / name).write_text(body, encoding="utf-8")
        entries.append({"file": name, "characters": len(body),
                        "first": body.splitlines()[0][:180]})
    metadata = {"sourceDirectory": str(source.resolve()),
                "recording": manifest.get("identity", {}).get("source"),
                "fingerprint": digest.hexdigest(), "segmentCount": count,
                "maxCharacters": limit, "packets": entries}
    (destination / "index.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    index_lines = ["# Recording reading index", "",
                   f"Source: {source.resolve()}",
                   f"Segments: {count}; packets: {len(packets)}", "",
                   "Machine transcript; timestamps are approximate. Not reviewed.",
                   "Read every packet once for complete coverage. Search is for follow-ups.",
                   "Track reviewed packets and topic notes in a separate coverage.md.", ""]
    index_lines.extend(f"- {entry['file']} ({entry['characters']} chars): {entry['first']}"
                       for entry in entries)
    (destination / "INDEX.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")
    return destination, count, len(packets)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="One directory with manifest and chunk JSONL")
    parser.add_argument("output", type=Path, help="Private output root, e.g. .cache/session-packets")
    parser.add_argument("--max-chars", type=int, default=12000,
                        help="Packet character limit, not a tokenizer estimate")
    args = parser.parse_args()
    try:
        destination, segments, packets = prepare(args.source, args.output, args.max_chars)
    except (OSError, ValueError, KeyError, TypeError) as error:
        parser.exit(1, f"Preparation failed: {error}\n")
    print(f"Prepared {segments} segments in {packets} packets. Index: {destination / 'INDEX.md'}")


if __name__ == "__main__":
    main()
