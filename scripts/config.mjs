import path from 'path';
import { cjs } from './utils.mjs';

const { __dirname } = cjs(import.meta.url);

const root = path.join(__dirname, '..');
const comps_dir = path.join(root, 'components');

export default {
  components: [
    {
      name: 'form',
      entry: path.join(comps_dir, 'form/index.tsx'),
      filename: 'form/index.js',
    },
    {
      name: 'table',
      entry: path.join(comps_dir, 'table/index.tsx'),
      filename: 'table/index.js',
    },
  ],
  root,
};
