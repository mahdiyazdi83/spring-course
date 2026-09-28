import { spawn } from 'node:child_process';
import { mkdirSync, openSync, closeSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, '.cache', 'checks');
mkdirSync(directory, { recursive: true });
const log = join(directory, `${Date.now()}-${process.pid}.log`);
const fd = openSync(log, 'w');
const npm = process.env.npm_execpath;
if (!npm) {
  closeSync(fd);
  throw new Error('Run via npm run check:quiet');
}
console.log(`Running the complete check pipeline. Full log: ${log}`);
const child = spawn(process.execPath, [npm, 'run', 'check'], {
  cwd: root,
  stdio: ['ignore', fd, fd],
});
closeSync(fd);
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  if (code === 0) {
    console.log(`PASS: format, lint, types, tests, content, build and links. Log: ${log}`);
  } else {
    console.error(`FAIL (${signal ?? code}). Last 50 lines; full log: ${log}`);
    console.error(readFileSync(log, 'utf8').split(/\r?\n/).slice(-50).join('\n'));
  }
  process.exitCode = code === 0 ? 0 : (code ?? 1);
});
