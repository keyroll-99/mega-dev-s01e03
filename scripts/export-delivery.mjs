import { readFileSync, writeFileSync } from 'node:fs';
const sourcePath = 'src/routes/kb/incidents/4471-review/+page.svx';
const renderedPath = 'build/kb/incidents/4471-review/index.html';
writeFileSync('kb.svx', readFileSync(sourcePath));
let html = readFileSync(renderedPath, 'utf8');
// A portable, self-contained print of actual SSR output, not a hand-written substitute.
html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '');
html = html.replace(/<link href="\.\.\/\.\.\/\.\.\/([^\"]+)" rel="stylesheet">/g, (_, asset) => `<style>${readFileSync('build/' + asset, 'utf8')}</style>`);
html = html.replace(/<script>[\s\S]*?<\/script>/g, '');
html = html.replace(/href="\/kb([^\"]*)"/g, 'href="./rendered/kb$1"');
// Input controls are a static rendering here; the full rendered/ site retains interaction.
html = html.replace(/<(input|select)\b/g, '<$1 disabled');
writeFileSync('kb.html', html);
writeFileSync('delivery.json', JSON.stringify({
  source: 'kb.svx', rendered: 'kb.html',
  canonicalSource: sourcePath, interactiveRendered: 'rendered/kb/incidents/4471-review/index.html',
  signatureSource: 'kb.svx frontmatter (exact course-issued proof)'
}, null, 2) + '\n');
console.log('Exported canonical source to kb.svx and actual styled SSR output to standalone kb.html.');
