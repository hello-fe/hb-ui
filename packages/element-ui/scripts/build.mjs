import fs from 'fs'
import path from 'path'
import chalk from 'chalk';
import { transformFileSync } from '@babel/core';
import babelConfig from './babel.config.mjs';
import config from './config.mjs';
import { cjs } from './utils.mjs';

const TAG = chalk.bgBlue(' build.mjs ');
const { __dirname } = cjs(import.meta.url);

fs.rmSync(path.join(__dirname, '../es'), { recursive: true });

for (const comp of config.components) {
  const entry = path.join(config.comps_dir, comp.entry);
  const filename = path.join(config.out_dir, comp.filename);
  const parsed = path.parse(filename);
  const result = transformFileSync(entry, {
    ...babelConfig,
    sourceMaps: true,
    sourceFileName: path.posix.relative(filename, entry),
  });

  if (!result) continue;

  const code = result.code + `\n//# sourceMappingURL=${parsed.base}.map`

  fs.existsSync(parsed.dir) || fs.mkdirSync(parsed.dir, { recursive: true });
  fs.writeFileSync(filename, code);
  fs.writeFileSync(filename + '.map', JSON.stringify(result.map));

  console.log(TAG, `write: ${filename}`);
}
