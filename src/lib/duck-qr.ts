// Rubber duck SVG for the QR code center overlay.
// Outline style (white fill + black stroke) so it reads as a duck silhouette
// rather than a filled blob at small display sizes.
//
// Layout in a 52×42 viewBox:
//   - Tail:  curved bump behind the right side of the body
//   - Body:  landscape ellipse, lower-right
//   - Neck cover: white ellipse hiding the stroke intersection
//   - Head:  large circle overlapping body upper-left
//   - Beak:  flat RECTANGULAR bill — the key feature that reads as "rubber duck"
//   - Eye:   small filled circle
//
// Natural size 208×168 so the browser rasterizes from a large crisp image
// and downscales cleanly into the draw target.

const DUCK_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 42" width="208" height="168">',
  '<rect width="52" height="42" fill="white"/>',
  // Tail — curved bump on the right of the body (drawn first, behind body)
  '<path d="M 44 21 C 49 18 51 12 47 10 C 45 14.5 43 13 44 21 Z" fill="black"/>',
  // Body — large landscape ellipse
  '<ellipse cx="30" cy="32" rx="16" ry="10" fill="white" stroke="black" stroke-width="3"/>',
  // Neck cover — white, no stroke, hides the crossing strokes where head meets body
  '<ellipse cx="23" cy="28" rx="8" ry="9" fill="white"/>',
  // Head — large circle sitting above and slightly left of body
  '<circle cx="21" cy="20" r="12" fill="white" stroke="black" stroke-width="3"/>',
  // Beak — flat rectangular bill pointing left (reads unmistakably as rubber duck)
  '<rect x="1" y="16" width="10" height="6" rx="1" fill="black"/>',
  // Eye — filled circle, upper-left quadrant of head
  '<circle cx="15" cy="16" r="3" fill="black"/>',
  '</svg>',
].join('');

// base64 is more universally supported than URL-encoded SVG in <img src>
export const DUCK_QR_URI = `data:image/svg+xml;base64,${btoa(DUCK_SVG)}`;

// imageSettings to pass to <QRCodeCanvas>.
// excavate:true punches a white hole so the duck sits on a clean background.
// 32×26 for the visible on-screen QR codes (maps ≈to viewBox ratio 52×42 ≈ 1.24:1).
export const DUCK_IMAGE_SETTINGS = {
  src: DUCK_QR_URI,
  width: 32,
  height: 26,
  excavate: true,
} as const;

// Larger imageSettings for the hidden high-res 400px download canvas.
// At 400px canvas size, 80×65 fills the excavated region crisply without upscaling.
export const DUCK_IMAGE_SETTINGS_LARGE = {
  src: DUCK_QR_URI,
  width: 80,
  height: 65,
  excavate: true,
} as const;
