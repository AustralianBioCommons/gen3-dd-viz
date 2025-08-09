// Copy the built app (apps/dd-viz-app/dist) into this package's public/ for publishing
import fs from 'fs';
import path from 'path';

const src = path.resolve(process.cwd(), 'apps/dd-viz-app/dist');
const dest = path.resolve(process.cwd(), 'packages/ddviz-cli/public');

function rmrf(p) {
  if (fs.existsSync(p)) {
    for (const e of fs.readdirSync(p)) {
      const cur = path.join(p, e);
      if (fs.lstatSync(cur).isDirectory()) rmrf(cur); else fs.unlinkSync(cur);
    }
    fs.rmdirSync(p);
  }
}

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const e of fs.readdirSync(srcDir)) {
    const s = path.join(srcDir, e);
    const d = path.join(destDir, e);
    if (fs.lstatSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(src)) {
  console.error('Expected built app at', src, '— run the build first.');
  process.exit(1);
}

rmrf(dest);
copyDir(src, dest);
console.log('Copied app dist to', dest);
