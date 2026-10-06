// Pixel-art rubber duck SVG, used as the center overlay on every QR code.
// Facing right: yellow body, orange beak, black eye.
// viewBox is 10×8 so the beak can stick out past the head without clipping.
const DUCK_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8">',
  // head top
  '<rect x="3" y="0" width="3" height="1" fill="#FCD34D"/>',
  // head mid
  '<rect x="2" y="1" width="5" height="1" fill="#FCD34D"/>',
  // head with eye row
  '<rect x="2" y="2" width="5" height="1" fill="#FCD34D"/>',
  '<rect x="3" y="2" width="1" height="1" fill="#1a1a1a"/>',  // eye
  // beak (two pixels wide, sticks out right)
  '<rect x="7" y="1" width="2" height="1" fill="#F97316"/>',
  '<rect x="7" y="2" width="2" height="1" fill="#F97316"/>',
  // neck
  '<rect x="3" y="3" width="3" height="1" fill="#FCD34D"/>',
  // body
  '<rect x="1" y="4" width="7" height="1" fill="#FCD34D"/>',
  '<rect x="0" y="5" width="8" height="2" fill="#FCD34D"/>',
  '<rect x="1" y="7" width="6" height="1" fill="#FCD34D"/>',
  '</svg>',
].join('');

export const DUCK_QR_URI = `data:image/svg+xml,${encodeURIComponent(DUCK_SVG)}`;

// imageSettings to pass to <QRCodeCanvas>
// Width:height = 10:8 matches the SVG aspect ratio.
// excavate:true punches a hole so the duck doesn't cover live QR modules.
export const DUCK_IMAGE_SETTINGS = {
  src: DUCK_QR_URI,
  width: 30,
  height: 24,
  excavate: true,
} as const;
