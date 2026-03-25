import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as esbuild from 'esbuild';
import * as dotenv from 'dotenv';
import { globSync } from 'glob';

dotenv.config();

const isWatch = process.argv.includes('--watch');
const CACHE_DIR = '.build-cache';

// --- Plugins ---

/** Resolves @/* and @lib/* path aliases to .build-cache/ */
const pathAliasPlugin = {
  name: 'path-alias',
  setup(build) {
    build.onResolve({ filter: /^@lib\// }, (args) => ({
      path: path.resolve(CACHE_DIR, 'lib', args.path.replace(/^@lib\//, '')) + '.js',
    }));
    build.onResolve({ filter: /^@\// }, (args) => ({
      path: path.resolve(CACHE_DIR, args.path.replace(/^@\//, '')) + '.js',
    }));
  },
};

/** Cleans up .oajs output: removes module banner comments and trailing export blocks */
const cleanOutputPlugin = {
  name: 'clean-output',
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length > 0) return;
      for (const filePath of Object.keys(result.metafile?.outputs || {})) {
        if (filePath.endsWith('.oajs')) {
          let code = fs.readFileSync(filePath, 'utf-8');
          code = code.replace(/^\/\/ \.build-cache\/.*\n/gm, '');
          code = code.replace(/export\s*\{[^}]*\};?\s*$/g, '');
          fs.writeFileSync(filePath, code);
        }
      }
    });
  },
};

// --- Helpers ---

function clean(...dirs) {
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
}

function runTsc() {
  execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });
}

function getEntryPoints() {
  return globSync(`${CACHE_DIR}/scripts/**/*.js`).map((f) => f.replace(/\\/g, '/'));
}

function getBuildOptions(entryPoints) {
  return {
    entryPoints,
    bundle: true,
    outdir: 'dist',
    outbase: `${CACHE_DIR}/scripts`,
    outExtension: { '.js': '.oajs' },
    format: 'esm',
    target: 'es5',
    treeShaking: true,
    metafile: true,
    define: {
      'process.env.TG_BOT_TOKEN': JSON.stringify(process.env.TG_BOT_TOKEN || ''),
      'process.env.TG_CHAT_ID': JSON.stringify(process.env.TG_CHAT_ID || ''),
      'process.env.TG_THREAD_ID': JSON.stringify(process.env.TG_THREAD_ID || ''),
    },
    plugins: [pathAliasPlugin, cleanOutputPlugin],
  };
}

// --- Build modes ---

async function buildOnce() {
  clean('dist', CACHE_DIR);

  console.log('Compiling TypeScript...');
  runTsc();

  console.log('Bundling with esbuild...');
  const entryPoints = getEntryPoints();
  await esbuild.build(getBuildOptions(entryPoints));

  clean(CACHE_DIR);
  console.log(`Build complete. ${entryPoints.length} scripts compiled.`);
}

async function buildWatch() {
  clean('dist', CACHE_DIR);

  console.log('Initial TypeScript compilation...');
  runTsc();

  console.log('Bundling with esbuild...');
  const entryPoints = getEntryPoints();
  const ctx = await esbuild.context(getBuildOptions(entryPoints));
  await ctx.rebuild();
  console.log(`Initial build complete. ${entryPoints.length} scripts compiled.`);

  // Start tsc in watch mode as background process
  const tscProcess = spawn('npx', ['tsc', '-p', 'tsconfig.build.json', '--watch', '--preserveWatchOutput'], {
    stdio: 'inherit',
    shell: true,
  });

  // Watch .build-cache for changes and trigger esbuild rebuild
  let rebuildTimeout;
  fs.watch(CACHE_DIR, { recursive: true }, () => {
    clearTimeout(rebuildTimeout);
    rebuildTimeout = setTimeout(async () => {
      try {
        clean('dist');
        await ctx.rebuild();
        console.log('Rebuild complete.');
      } catch (err) {
        console.error('Rebuild failed:', err.message);
      }
    }, 300);
  });

  console.log('Watching for changes...');

  process.on('SIGINT', () => {
    tscProcess.kill();
    ctx.dispose();
    clean(CACHE_DIR);
    process.exit();
  });
}

// --- Entry point ---

if (isWatch) {
  buildWatch();
} else {
  buildOnce();
}
