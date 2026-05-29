import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const svg = readFileSync('public/favicon.svg');

// Generate 32x32 PNG
const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
// Generate 16x16 PNG
const png16 = await sharp(svg).resize(16, 16).png().toBuffer();

// Write standalone PNG for <link> usage
writeFileSync('public/favicon.png', png32);

// Build ICO file (container for multiple PNG images)
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);  // reserved
  header.writeUInt16LE(1, 2);  // type: 1 = icon
  header.writeUInt16LE(count, 4);

  // Directory entries: 16 bytes each
  let offset = 6 + count * 16;
  const entries = pngBuffers.map((buf) => {
    const w = buf.length < 2000 ? 16 : 32;
    const entry = Buffer.alloc(16);
    entry.writeUInt8(w, 0);       // width
    entry.writeUInt8(w, 1);       // height
    entry.writeUInt8(0, 2);       // color palette
    entry.writeUInt8(0, 3);       // reserved
    entry.writeUInt16LE(1, 4);    // color planes
    entry.writeUInt16LE(32, 6);   // bits per pixel
    entry.writeUInt32LE(buf.length, 8);  // size in bytes
    entry.writeUInt32LE(offset, 12);     // file offset
    offset += buf.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

const ico = buildIco([png16, png32]);
writeFileSync('public/favicon.ico', ico);

console.log('Generated:');
console.log(`  public/favicon.ico (${ico.length} bytes)`);
console.log(`  public/favicon.png (${png32.length} bytes)`);
