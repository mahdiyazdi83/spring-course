import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location(
    "prepare_session", Path(__file__).resolve().parents[1] / "scripts/prepare-session.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PacketTests(unittest.TestCase):
    def test_bounded_lossless_packets_and_invalidation(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary) / "input"
            source.mkdir()
            manifest = source / "manifest.json"
            manifest.write_text(json.dumps({"complete": True}), encoding="utf-8")
            text = "مثال Bean " * 400
            chunk = source / "chunk-0000.jsonl"
            chunk.write_text(json.dumps({"start": 0, "end": 10, "text": text}), encoding="utf-8")
            output = Path(temporary) / "output"
            folder, count, packets = module.prepare(source, output, 1000)
            self.assertEqual(count, 1)
            self.assertGreater(packets, 1)
            bodies = [p.read_text(encoding="utf-8") for p in sorted(folder.glob("packet-*.txt"))]
            self.assertTrue(all(len(body) <= 1000 for body in bodies))
            recovered = "".join(line.split("] ", 1)[1] for body in bodies for line in body.splitlines())
            self.assertEqual(recovered, text)
            notes = folder / "coverage.md"
            notes.write_text("reviewed packet 1", encoding="utf-8")
            self.assertEqual(module.prepare(source, output, 1000)[0], folder)
            self.assertEqual(notes.read_text(encoding="utf-8"), "reviewed packet 1")
            chunk.write_text(json.dumps({"start": 0, "end": 10, "text": "changed"}), encoding="utf-8")
            self.assertNotEqual(module.prepare(source, output, 1000)[0], folder)
            manifest.write_text(json.dumps({"complete": False}), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "incomplete"):
                module.prepare(source, output)


if __name__ == "__main__":
    unittest.main()
