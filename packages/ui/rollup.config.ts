import type { RollupOptions } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import analyze from 'rollup-plugin-analyzer';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
// @ts-ignore
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import preserveDirectives from 'rollup-preserve-directives';
import autoprefixer from 'autoprefixer';
import { rmSync } from 'fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { createRequire } from 'node:module';

const pkgPath = resolve('package.json');
const currentDate = new Date().toUTCString();
const execPromise = promisify(exec);
const distDir = resolve('../../dist/packages/ui/dist');

let getBannerPromise: Promise<string> | null = null;

function resolve(...args: string[]): string {
  return path.resolve(process.cwd(), ...args);
}

function getPackageJson() {
  // @ts-ignore
  const require = createRequire(import.meta.url);
  return require(pkgPath);
}

function getBanner(): Promise<string> {
  return (getBannerPromise ||= Promise.all([
    execPromise('git rev-parse HEAD')
      .then(({ stdout }) => stdout.trim())
      .catch((error) => {
        console.error('Could not determine commit hash:', error);
        return 'unknown';
      }),
    getPackageJson(),
  ]).then(([commitHash, packageJson]) => {
    return `/*
  @license
	${packageJson.name} v${packageJson.version}
	${currentDate} - commit ${commitHash}
*/`;
  }));
}

export default async function getConfig(): Promise<
  RollupOptions | Array<RollupOptions>
> {
  // const extensions = ['.js', '.jsx', '.ts', '.tsx'];

  rmSync(distDir, { recursive: true, force: true });

  const commonJsBuild = {
    onwarn: (warning, warn) => {
      if (
        warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
        /\"use client\"/.test(warning.message)
      ) {
        return;
      }

      warn(warning);
    },
    input: {
      index: 'src/index.ts',
    },
    output: {
      dir: distDir,
      entryFileNames: '[name].cjs',
      exports: 'named',
      format: 'cjs',
      interop: 'auto',
      sourcemap: true,
      banner: getBanner,
      // intro: '"use client";',
    },
    external: ['react/jsx-runtime'],
    plugins: [
      peerDepsExternal({
        packageJsonPath: pkgPath,
      }),
      preserveDirectives(),
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: 'tsconfig.lib.json',
        compilerOptions: {
          outDir: distDir,
          declarationDir: resolve(distDir, 'types'),
        },
      }),
      postcss({
        plugins: [autoprefixer()],
        // extract: false,
        // modules: true,
        // use: ["sass"],
      }),
      terser({
        // format: {
        //   // remove comments
        //   comments: false,
        // },
        compress: {
          // remove console.*
          drop_console: true,
          // to do not remove directives for 'use client'
          directives: false,
        },
      }),
      copy({
        targets: [
          {
            src: resolve('README.md'),
            dest: resolve(distDir, '..'),
          },
          {
            src: resolve('package.json'),
            dest: resolve(distDir, '..'),
          },
          // {
          //   src: resolve('dist/types'),
          //   dest: distDir,
          // },
        ],
      }),
      analyze({ summaryOnly: true }),
    ],
  } satisfies RollupOptions;

  const esmBuild = {
    ...commonJsBuild,
    output: {
      ...commonJsBuild.output,
      format: 'esm',
      minifyInternalExports: false,
      sourcemap: false,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: (chunkInfo) => {
        if (chunkInfo.name.includes('node_modules')) {
          return chunkInfo.name.replace('node_modules', 'external') + '.js';
        }

        return '[name].mjs';
      },
    },
  } satisfies RollupOptions;

  return [commonJsBuild, esmBuild];
}
