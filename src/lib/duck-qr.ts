// Pixel-art rubber duck SVG for the QR code center overlay.
// 16×14 grid, facing left — black silhouette with white eye.
// Designed for legibility at small sizes and thermal-printer output.
//
// Grid (. = empty, # = black, W = white eye):
//   .....####.......  row 0  head tuft
//   ....#######.....  row 1  head
//   ...#########....  row 2  head wide
//   .####WW#####....  row 3  beak + eye + head
//   ##..########.##.  row 4  beak tip + body top + tail
//   #...#########.##  row 5  beak end + body + tail
//   ...############.  row 6  body
//   ..#############.  row 7  body
//   ..#############.  row 8  body
//   ..############..  row 9  body
//   ...###########..  row 10 body
//   ....##########..  row 11 body
//   .....########...  row 12 body lower
//   ......######....  row 13 bottom

const DUCK_SVG = [
  // explicit width/height so browsers report non-zero naturalWidth/naturalHeight
  // shape-rendering="crispEdges" prevents SVG antialiasing on pixel art edges
  // 32×28 = exactly 2× the 16×14 grid → every rect maps to whole display pixels
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 14" width="32" height="28" shape-rendering="crispEdges">',
  // white background (needed for eye cutout to show)
  '<rect width="16" height="14" fill="white"/>',
  // row 0 — head tuft
  '<rect x="5" y="0" width="4" height="1" fill="black"/>',
  // row 1 — head
  '<rect x="4" y="1" width="7" height="1" fill="black"/>',
  // row 2 — head wide
  '<rect x="3" y="2" width="9" height="1" fill="black"/>',
  // row 3 — full span black first, then punch out white eye
  '<rect x="1" y="3" width="11" height="1" fill="black"/>',
  // row 4 — beak (0-1), head/body (4-11), tail (13-14)
  '<rect x="0" y="4" width="2" height="1" fill="black"/>',
  '<rect x="4" y="4" width="8" height="1" fill="black"/>',
  '<rect x="13" y="4" width="2" height="1" fill="black"/>',
  // row 5 — beak tip (0), body (4-12), tail (14-15)
  '<rect x="0" y="5" width="1" height="1" fill="black"/>',
  '<rect x="4" y="5" width="9" height="1" fill="black"/>',
  '<rect x="14" y="5" width="2" height="1" fill="black"/>',
  // row 6 — body (3-15)
  '<rect x="3" y="6" width="13" height="1" fill="black"/>',
  // rows 7-8 — body widest (2-14)
  '<rect x="2" y="7" width="13" height="2" fill="black"/>',
  // row 9 — body (2-13)
  '<rect x="2" y="9" width="12" height="1" fill="black"/>',
  // row 10 — body (3-13)
  '<rect x="3" y="10" width="11" height="1" fill="black"/>',
  // row 11 — body (4-13)
  '<rect x="4" y="11" width="10" height="1" fill="black"/>',
  // row 12 — body (5-12)
  '<rect x="5" y="12" width="8" height="1" fill="black"/>',
  // row 13 — bottom (6-11)
  '<rect x="6" y="13" width="6" height="1" fill="black"/>',
  // eye — white on top of the black from row 3
  '<rect x="5" y="3" width="2" height="1" fill="white"/>',
  '</svg>',
].join('');

// base64 is more universally supported than URL-encoded SVG in <img src>
export const DUCK_QR_URI = `data:image/svg+xml;base64,${btoa(DUCK_SVG)}`;

// imageSettings to pass to <QRCodeCanvas>.
// excavate:true punches a white hole so the duck sits on a clean background.
export const DUCK_IMAGE_SETTINGS = {
  src: DUCK_QR_URI,
  width: 32,
  height: 28,
  excavate: true,
} as const;
