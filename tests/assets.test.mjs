import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const execFileAsync = promisify(execFile);

test('la preparación incluye los logos PNG y SVG originales', async () => {
  await execFileAsync(process.execPath, ['build.mjs'], {cwd:root});
  for (const extension of ['png', 'svg']) {
    const name = `logo_yazu.${extension}`;
    const original = await readFile(path.join(root, 'InsumosYaZú.tx', 'Timbó', 'Logomarca', name));
    const asset = await readFile(path.join(root, '.worker-assets', 'assets', name));
    assert.deepEqual(asset, original);
  }
});
