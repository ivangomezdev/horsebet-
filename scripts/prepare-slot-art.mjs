import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const manifest = JSON.parse(await fs.readFile('outputs/slot-asset-manifest.json','utf8'));
const destination = path.resolve('public/images/slots');
await fs.mkdir(destination,{recursive:true});
for (const asset of manifest) {
  if (asset.id === 'symbol-atlas') {
    await sharp(asset.path).webp({quality:92,alphaQuality:100}).toFile(path.join(destination,'symbols.webp'));
  } else {
    await sharp(asset.path).resize({width:1536,withoutEnlargement:true}).webp({quality:87}).toFile(path.join(destination,`${asset.id}.webp`));
    await sharp(asset.path).resize({width:720,withoutEnlargement:true}).webp({quality:88}).toFile(path.join(destination,`${asset.id}-cover.webp`));
  }
}
console.log(`Prepared ${manifest.length} original assets in ${destination}`);
