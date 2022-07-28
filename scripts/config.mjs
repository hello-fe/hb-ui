import path from 'path';
import { cjs } from './utils.mjs';

const { __dirname } = cjs(import.meta.url);

const root = path.join(__dirname, '..');
const comps_dir = path.join(root, 'components');
const out_dir = path.join(root, 'es');

export default {
  components: [
    {
      name: '',
      entry: 'index.ts',
      filename: 'index.js',
    },
    {
      name: 'form',
      entry: 'form/index.tsx',
      filename: 'form/index.js',
    },
    {
      name: 'table',
      entry: 'table/index.tsx',
      filename: 'table/index.js',
    },
  ],
  root,
  comps_dir,
  out_dir,
};
