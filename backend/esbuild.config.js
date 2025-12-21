// esbuild.config.js
const { build } = require("esbuild");
const { tsPaths } = require("esbuild-ts-paths");

build({
  entryPoints: ["index.ts"],
  bundle: true,
  platform: "node",
  outfile: "index.js",
  // Register the plugin
  plugins: [tsPaths()],
}).catch(() => process.exit(1));
