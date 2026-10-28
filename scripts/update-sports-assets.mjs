import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const source = JSON.parse(await readFile('outputs/sports-reference-assets.json', 'utf8'));
const base = 'public/images/sports';
await mkdir(`${base}/icons`, { recursive: true });
await mkdir(`${base}/teams`, { recursive: true });
for (const icon of source.icons) {
  const svg = icon.svg.replace(/ style="[^"]*"/g, '').replace(/ data-cy="[^"]*"/g, '');
  await writeFile(`${base}/icons/${icon.name}.svg`, svg);
}
const teams = [...new Map(source.teams.map(team => [team.src, team])).values()];
const results = [];
for (let i = 0; i < teams.length; i += 8) {
  const batch = await Promise.all(teams.slice(i, i + 8).map(async team => {
    const response = await fetch(team.src);
    if (!response.ok) throw new Error(`${team.name}: ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.subarray(1, 4).toString() !== 'PNG') throw new Error(`Invalid PNG: ${team.name}`);
    const file = path.basename(new URL(team.src).pathname);
    await writeFile(`${base}/teams/${file}`, bytes);
    return { ...team, local: `/images/sports/teams/${file}` };
  }));
  results.push(...batch);
}
await writeFile('data/sports-team-assets.json', JSON.stringify(Object.fromEntries(results.map(t => [t.name, t.local])), null, 2));
await writeFile(`${base}/sources.json`, JSON.stringify({ reference: source.source, retrieved: '2026-10-27', note: 'Reference UI icons and club marks for the local HorseBet design prototype. Third-party assets; no ownership or open-source license is claimed.', teams: results }, null, 2));
console.log(`Saved ${source.icons.length} icons and ${results.length} team crests`);
