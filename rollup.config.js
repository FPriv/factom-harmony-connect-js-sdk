// Rollup plugins.
import babel from 'rollup-plugin-babel';
import cjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import alias from 'rollup-plugin-alias';
import path from 'path';
import pkg from './package.json';

export default [
  {
    input: 'lib/factom-harmony-connect-js-sdk.js',
    output: [
      { name: 'FactomHarmonyConnectSDK', file: pkg.browser, format: 'iife' },
      { name: 'FactomHarmonyConnectSDK', file: pkg.main, format: 'cjs' },
      { name: 'FactomHarmonyConnectSDK', file: pkg.module, format: 'es' },
    ],
    plugins: [
      alias({
        elliptic: path.resolve(__dirname, 'includes/elliptic.js'),
      }),
      builtins(),
      resolve({
        browser: true,
        main: true,
        preferBuiltins: true,
      }),
      cjs({
        include: ['node_modules/**', 'includes/**'],
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
      globals(),
      json(),
    ],
  },
];
