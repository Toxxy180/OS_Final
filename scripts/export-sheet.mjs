import { spawn } from 'node:child_process';
import { access, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
const candidates = [process.env.CHROME_BIN,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
let executable;
for (const candidate of candidates) { try { await access(candidate); executable=candidate; break; } catch {} }
if (!executable) throw new Error('Set CHROME_BIN to your Chrome/Chromium executable.');
const url = process.argv[2] || 'http://127.0.0.1:5173/#/sheet';
const output = resolve('public/os-final-a4.pdf');
await mkdir('public', {recursive:true});
await mkdir('tmp', {recursive:true});
const profile = resolve(`tmp/pdf-export-${Date.now()}`);
const args = ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${output}`,
  '--virtual-time-budget=10000', `--user-data-dir=${profile}`, url];
await new Promise((resolvePromise,reject) => {
  const child=spawn(executable,args,{windowsHide:true,stdio:'ignore'});
  child.on('error',reject);
  child.on('exit',code=>code===0?resolvePromise():reject(new Error(`PDF export exited ${code}`)));
});
if ((await stat(output)).size < 10000) throw new Error('PDF is unexpectedly small. Ensure the dev server is running and retry.');
console.log(`Exported ${output}. Verify it contains two A4 pages before publishing.`);
