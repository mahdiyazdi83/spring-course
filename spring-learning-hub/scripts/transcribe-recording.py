"""Local Persian ASR. Raw output is evidence for editing, never publishable prose."""

import argparse
import json
import os
from pathlib import Path
import time

import av
import numpy as np
from faster_whisper import BatchedInferencePipeline, WhisperModel


def chunks(source, seconds):
    """Bound memory use instead of loading a multi-hour recording into one FFT."""
    with av.open(str(source)) as container:
        resampler = av.AudioResampler(format="s16", layout="mono", rate=16000)
        pieces, count, offset = [], 0, 0.0
        for frame in container.decode(audio=0):
            for converted in resampler.resample(frame):
                data = converted.to_ndarray().flatten()
                pieces.append(data)
                count += len(data)
                if count >= seconds * 16000:
                    audio = np.concatenate(pieces).astype(np.float32) / 32768.0
                    yield offset, audio
                    offset += len(audio) / 16000
                    pieces, count = [], 0
        for converted in resampler.resample(None):
            pieces.append(converted.to_ndarray().flatten())
        if pieces:
            yield offset, np.concatenate(pieces).astype(np.float32) / 32768.0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path, help="Private JSONL output directory")
    parser.add_argument("--model", required=True, type=Path, help="Downloaded model directory")
    parser.add_argument("--threads", type=int, default=12)
    parser.add_argument("--chunk-seconds", type=int, default=180)
    parser.add_argument("--batch-size", type=int, default=4)
    args = parser.parse_args()
    if min(args.threads, args.chunk_seconds, args.batch_size) < 1:
        parser.error("Thread, chunk and batch sizes must be positive")
    if not args.source.is_file() or not args.model.is_dir():
        parser.error("Source file and local model directory must exist")
    args.output.mkdir(parents=True, exist_ok=True)
    identity = {
        "source": str(args.source.resolve()),
        "sourceBytes": args.source.stat().st_size,
        "sourceMtimeNs": args.source.stat().st_mtime_ns,
        "model": str(args.model.resolve()),
        "language": "fa",
        "chunkSeconds": args.chunk_seconds,
        "batchSize": args.batch_size,
    }
    manifest = args.output / "manifest.json"
    if manifest.exists():
        previous = json.loads(manifest.read_text(encoding="utf-8"))
        if previous["identity"] != identity:
            parser.error("Source/model/settings changed; choose a new output directory")
        if previous.get("complete"):
            print("Already complete; existing evidence retained", flush=True)
            return
    else:
        if any(args.output.glob("chunk-*.jsonl")):
            parser.error("Existing chunks without a manifest; choose a new output directory")
        manifest.write_text(json.dumps({"identity": identity, "complete": False,
            "processedSeconds": 0}, indent=2), encoding="utf-8")
    os.environ["HF_HUB_OFFLINE"] = "1"
    pipeline = BatchedInferencePipeline(
        model=WhisperModel(str(args.model), device="cpu", compute_type="int8", cpu_threads=args.threads)
    )
    started, duration = time.time(), 0.0
    for index, (offset, audio) in enumerate(chunks(args.source, args.chunk_seconds)):
        target = args.output / f"chunk-{index:04d}.jsonl"
        duration = offset + len(audio) / 16000
        if target.exists():
            continue
        temporary = target.with_suffix(".partial")
        segments, _ = pipeline.transcribe(
            audio, language="fa", beam_size=1, vad_filter=True, batch_size=args.batch_size
        )
        with temporary.open("w", encoding="utf-8") as output:
            for segment in segments:
                output.write(json.dumps({
                    "start": offset + segment.start,
                    "end": offset + segment.end,
                    "text": segment.text,
                    "avg_logprob": segment.avg_logprob,
                    "no_speech_prob": segment.no_speech_prob,
                }, ensure_ascii=False) + "\n")
        temporary.replace(target)
        manifest.write_text(json.dumps({"identity": identity, "complete": False,
            "processedSeconds": duration}, indent=2), encoding="utf-8")
        print(f"Processed {duration:.0f}s; elapsed {time.time() - started:.0f}s", flush=True)
    manifest.write_text(json.dumps({"identity": identity, "complete": True,
        "durationSeconds": duration,
        "notice": "Machine transcript: verify terminology, speakers and claims before attribution."
    }, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
