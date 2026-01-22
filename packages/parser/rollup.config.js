import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { copyFileSync } from 'fs';

// Plugin to copy types.d.ts to dist
const copyTypes = () => ({
  name: 'copy-types',
  writeBundle() {
    copyFileSync('src/types.d.ts', 'dist/types.d.ts');
  }
});

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true
    }
  ],
  external: ['ohm-js'],
  plugins: [
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist'
    }),
    copyTypes()
  ]
};