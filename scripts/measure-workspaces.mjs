// CR-041 · FR-CMP-010/011 · import isolation and optional bundle measurements.
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import esbuildPlugin from '@size-limit/esbuild';
import filePlugin from '@size-limit/file';
import sizeLimit from 'size-limit';
const output = resolve(process.env.CONDUCTOR_EVIDENCE ?? '/tmp/conductor-evidence');
await mkdir(output, { recursive: true });
const measurements = [];
for (const [symbol, entry] of [['Button', 'index'], ['Combobox', 'index'], ['DataTable', 'index'], ['ProcessingStatus', 'index'], ['RelationGraph', 'relation']]) {
  const path = resolve(`packages/react/dist/${entry}.js`);
  const check = { files: [path], import: { [path]: `{ ${symbol} }` }, ignore: ['react', 'react-dom', 'lucide-react'], gzip: true };
  const [result] = await sizeLimit([filePlugin, esbuildPlugin], { checks: [check] });
  const modules = [...new Set(Object.values(check.esbuildMetafile.outputs).flatMap(file => Object.entries(file.inputs).filter(([, input]) => input.bytesInOutput > 0).map(([name]) => name)))];
  measurements.push({ symbol, entry, gzipBytes: result.size, contributingModules: modules });
  if (['Button', 'DataTable', 'ProcessingStatus'].includes(symbol) && modules.some(name => (/downshift|relation\.js|interaction\.js/.test(name) || symbol === 'Button' && /workbench\.js/.test(name)))) throw new Error(`Optional features leaked into ${symbol}`);
  if (symbol === 'RelationGraph' && result.size > 8 * 1024) throw new Error('RelationGraph exceeds its 8 KiB gzip budget');
}
await writeFile(`${output}/import-costs.json`, JSON.stringify({ node: process.version, compression: 'gzip level 9', excludedPeers: ['react', 'react-dom', 'lucide-react'], measurements }, null, 2));
console.log(measurements.map(({ symbol, gzipBytes }) => `${symbol}: ${gzipBytes} gzip bytes`).join('\n'));
