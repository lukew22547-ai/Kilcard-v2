import { cpSync, mkdirSync, writeFileSync } from "fs";

const output = ".vercel/output";

mkdirSync(`${output}/functions/index.func`, { recursive: true });
mkdirSync(`${output}/static`, { recursive: true });

// Static assets → .vercel/output/static/
cpSync("dist/client", `${output}/static`, { recursive: true });

// Server bundle → .vercel/output/functions/index.func/
cpSync("dist/server", `${output}/functions/index.func`, { recursive: true });

// Tell Vercel how to invoke the function (web fetch handler, Node 24)
writeFileSync(
  `${output}/functions/index.func/.vc-config.json`,
  JSON.stringify({
    runtime: "nodejs24.x",
    handler: "index.mjs",
    launcherType: "Nodejs",
    supportsResponseStreaming: true,
  }, null, 2)
);

// Route config: serve static files from filesystem, everything else → function
writeFileSync(
  `${output}/config.json`,
  JSON.stringify({
    version: 3,
    routes: [
      {
        src: "^/assets/(.*)$",
        headers: { "cache-control": "public, max-age=31536000, immutable" },
        continue: true,
      },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index" },
    ],
  }, null, 2)
);

console.log("Vercel output structure ready.");
