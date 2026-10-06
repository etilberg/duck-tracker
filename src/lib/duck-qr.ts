// Rubber duck SVG for the QR code center overlay.
// Outline style (white fill + black stroke) so it reads as a duck silhouette
// rather than a filled blob at small display sizes.
//
// Layout in a 44×36 viewBox:
//   - Body:  landscape ellipse, lower-right
//   - Head:  circle overlapping body upper-left
//   - Neck cover: white ellipse to hide the stroke intersection
//   - Beak:  small filled triangle pointing left
//   - Eye:   small filled circle
//   - Tail:  small curved bump at the right of the body
//
// Natural size 176×144 so the browser rasterizes from a large crisp image
// and downscales into the 32×26 draw target — downscaling from a sharp
// original is far cleaner than upscaling a small one.

const DUCK_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 36" width="176" height="144">',
  '<rect width="44" height="36" fill="white"/>',
  // Body — large landscape ellipse
  '<ellipse cx="27" cy="26" rx="14" ry="9" fill="white" stroke="black" stroke-width="2.5"/>',
  // Neck cover — white, no stroke, hides the crossing strokes where head meets body
  '<ellipse cx="21" cy="23" rx="6" ry="8" fill="white"/>',
  // Head — circle sitting above and slightly left of body
  '<circle cx="18" cy="16" r="9" fill="white" stroke="black" stroke-width="2.5"/>',
  // Beak — small filled triangle pointing left
  '<polygon points="9,14 3,16.5 9,19" fill="black"/>',
  // Eye — filled circle, upper-left quadrant of head
  '<circle cx="14" cy="13" r="2" fill="black"/>',
  // Tail — small curved bump on the upper-right of the body
  '<path d="M 39 18 C 42 16 44 12 42 10 C 40 13 38 12 39 18 Z" fill="black"/>',
  '</svg>',
].join('');

// base64 is more universally supported than URL-encoded SVG in <img src>
export const DUCK_QR_URI = `data:image/svg+xml;base64,${btoa(DUCK_SVG)}`;

// imageSettings to pass to <QRCodeCanvas>.
// excavate:true punches a white hole so the duck sits on a clean background.
// 32×26 keeps the aspect ratio of the 44×36 viewBox (≈1.22:1).
export const DUCK_IMAGE_SETTINGS = {
  src: DUCK_QR_URI,
  width: 32,
  height: 26,
  excavate: true,
} as const;
