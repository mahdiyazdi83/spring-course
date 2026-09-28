# Local recording transcription

Use only for recordings authorized by the user. Audio/video and raw transcripts stay
under `../records/`; never copy them into `public/` or the documentation collection.

The session-2 setup uses Python 3.12, faster-whisper 1.2.1 and the multilingual
large-v3-turbo CTranslate2 model on CPU with int8 quantization. Package/model downloads
require network access; inference is local. Do not send recordings to an external API.
The model and virtual environment are workspace caches, not Git assets or npm dependencies.

1. Create a virtual environment and install `scripts/transcription-requirements.txt`.
2. Download the model with `faster_whisper.utils.download_model('turbo', output_dir=...)`.
3. Run `python scripts/transcribe-recording.py INPUT PRIVATE_OUTPUT --model LOCAL_MODEL`.
4. Keep the generated manifest with its input identity, settings and completion state.
   Completed chunks are reused on restart; changed input/model/settings require a new output.
5. Review the complete transcript by topic, not just its beginning. Compare Java terms
   with the pinned code and inspect recording frames where useful. ASR can omit speech,
   repeat words or invent phrases during silence; do not copy these artifacts into lessons.
6. Treat times as approximate locating aids. Preserve speaker/source boundaries and
   keep Thursday independent. Do not identify a speaker solely from an ASR segment.
7. Write educational paraphrases, record meaningful gaps, then follow the session
   checklist and run `npm run check` plus built-preview checks.

The first session-2 run used the equivalent temporary workspace runner
`.cache/transcribe_session2.py` (relative to the workspace root), producing one JSONL
file and a completion manifest per recording under `../records/transcripts/session2/`.
An initial small-model trial was superseded by large-v3-turbo. The trial is not a source
for published claims. Chunked decoding avoids multi-gigabyte whole-recording FFT allocations.
