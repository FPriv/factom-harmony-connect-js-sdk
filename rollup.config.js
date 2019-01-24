// Rollup plugins.
import babel from 'rollup-plugin-babel';
import cjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import pkg from './package.json';

export default [
  {
    input: 'lib/api.js',
    output: [
      { name: 'factomHarmonyConnectSdk', file: pkg.browser, format: 'umd' },
      { name: 'factomHarmonyConnectSdk', file: pkg.main, format: 'cjs' },
      { name: 'factomHarmonyConnectSdk', file: pkg.module, format: 'es' },
    ],
    plugins: [
      json(),
      resolve({
        browser: true,
        main: true,
      }),
      cjs(),
      globals(),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
];
