// Rollup plugins.
import babel from 'rollup-plugin-babel';
import cjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import autoExternal from 'rollup-plugin-auto-external';
import pkg from './package.json';

export default [
  {
    input: 'lib/factom-harmony-connect-js-sdk.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    plugins: [
      autoExternal(),
      resolve(),
      cjs({
        include: ['node_modules/**'],
      }),
      babel({
        babelrc: false,
        runtimeHelpers: true,
        presets: [['env', { modules: false }]],
        plugins: [
          'transform-async-to-generator',
          'transform-runtime',
          'transform-object-rest-spread',
          'external-helpers'],
        exclude: 'node_modules/**',
      }),
    ],
  }
];
