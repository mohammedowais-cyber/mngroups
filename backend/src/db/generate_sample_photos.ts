import fs from 'fs';
import path from 'path';

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function createSampleSvg(filename: string, title: string, subtitle: string, tag: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#1C2E52" rx="12"/>
    <rect x="20" y="20" width="360" height="260" fill="#0F1B33" rx="8" stroke="#2E4372" stroke-width="2"/>
    <circle cx="200" cy="120" r="45" fill="${color}" opacity="0.15"/>
    <text x="200" y="128" fill="${color}" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">📷</text>
    <rect x="40" y="38" width="90" height="26" rx="13" fill="${color}"/>
    <text x="85" y="55" fill="#0F1B33" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${tag}</text>
    <text x="200" y="195" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">${title}</text>
    <text x="200" y="222" fill="#828EA3" font-family="sans-serif" font-size="12" text-anchor="middle">${subtitle}</text>
    <text x="200" y="255" fill="#B8902E" font-family="sans-serif" font-size="11" text-anchor="middle">MN GROUPS • PROPERTY MAINTENANCE</text>
  </svg>`;

  fs.writeFileSync(path.join(uploadsDir, filename), svg);
  console.log(`Created sample image: ${filename}`);
}

createSampleSvg('tap-leak-before.svg', 'Bathroom Tap Leakage', 'Water pooling near base valve', 'BEFORE PHOTO', '#B14B41');
createSampleSvg('tap-fixed-after.svg', 'Replaced Washer & Tested', 'Leak resolved under full pressure', 'AFTER PHOTO', '#347A5C');
createSampleSvg('cabinet-hinge-before.svg', 'Cabinet Door Off Hinge', 'Stripped screws on upper mount', 'BEFORE PHOTO', '#B14B41');
createSampleSvg('cabinet-hinge-after.svg', 'Heavy Duty Hinge Replaced', 'Door aligned and smoothly closing', 'AFTER PHOTO', '#347A5C');
createSampleSvg('ac-unit-before.svg', 'AC Choked Air Filter', 'Coil freezing and rattling noise', 'BEFORE PHOTO', '#B14B41');
createSampleSvg('ac-unit-after.svg', 'Filter Cleaned & Gas Charged', 'Cooling restored to 20°C', 'AFTER PHOTO', '#347A5C');
createSampleSvg('socket-spark-before.svg', 'Living Room Socket Sparks', 'Loose contact and burned terminal', 'BEFORE PHOTO', '#B14B41');
