/**
 * Copy MapLibre's worker bundle into public/.
 *
 * MapLibre resolves its worker from `import.meta.url`, which stops being an
 * http(s) URL once a bundler has processed the module — the resolver then
 * returns an empty string and the worker never starts, leaving a blank map.
 * Serving the worker ourselves and pointing `setWorkerUrl` at it is the
 * supported escape hatch. Re-run on install and before each build so the
 * asset always matches the installed version.
 */
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const pkgPath = require.resolve("maplibre-gl/package.json");
const dist = join(dirname(pkgPath), "dist");
const { version } = JSON.parse(await readFile(pkgPath, "utf8"));

await mkdir("public", { recursive: true });
await copyFile(join(dist, "maplibre-gl-worker.mjs"), join("public", "maplibre-gl-worker.mjs"));

console.log(`✓ public/maplibre-gl-worker.mjs synced from maplibre-gl@${version}`);
