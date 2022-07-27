import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

export function cjs(importURL) {
  const require = createRequire(importURL);
  const __filename = fileURLToPath(importURL);
  const __dirname = path.dirname(__filename);

  return {
    require,
    __filename,
    __dirname,
  };
}