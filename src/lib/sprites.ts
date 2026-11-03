import { CATEGORIES } from "./categories";

export interface SpriteImage {
  id: string;
  width: number;
  height: number;
  data: Uint8Array;
  pixelRatio: number;
}

const R = 2; // pixel ratio
const W = 34;
const H = 42;
const CHIP = 28;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draw one field-guide marker: a paper chip, an ink keyline in the category
 * colour, the category glyph, and a small stem so it reads as a pin in 3D.
 */
function drawChip(ctx: CanvasRenderingContext2D, color: string, iconPath: string, active: boolean) {
  const x = (W - CHIP) / 2;
  const y = 1;

  ctx.save();
  ctx.shadowColor = "rgba(58, 49, 39, 0.3)";
  ctx.shadowBlur = active ? 7 : 4;
  ctx.shadowOffsetY = 2;

  // stem
  ctx.beginPath();
  ctx.moveTo(W / 2 - 3.2, y + CHIP - 2);
  ctx.lineTo(W / 2, H - 5);
  ctx.lineTo(W / 2 + 3.2, y + CHIP - 2);
  ctx.closePath();
  ctx.fillStyle = active ? color : "#FBF7EC";
  ctx.fill();

  roundRect(ctx, x, y, CHIP, CHIP, 6);
  ctx.fillStyle = active ? color : "#FBF7EC";
  ctx.fill();
  ctx.restore();

  // keyline
  roundRect(ctx, x + 0.75, y + 0.75, CHIP - 1.5, CHIP - 1.5, 5.4);
  ctx.strokeStyle = active ? "#FBF7EC" : color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // stem keyline
  ctx.beginPath();
  ctx.moveTo(W / 2 - 3.2, y + CHIP - 0.6);
  ctx.lineTo(W / 2, H - 5);
  ctx.lineTo(W / 2 + 3.2, y + CHIP - 0.6);
  ctx.strokeStyle = active ? "#FBF7EC" : color;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // glyph — the 24x24 path scaled into an 18x18 box
  ctx.save();
  ctx.translate(x + (CHIP - 18) / 2, y + (CHIP - 18) / 2);
  ctx.scale(18 / 24, 18 / 24);
  ctx.strokeStyle = active ? "#FBF7EC" : color;
  ctx.lineWidth = 2.1;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke(new Path2D(iconPath));
  ctx.restore();

  // ground dot, so the pin stays legible against 3D buildings
  ctx.beginPath();
  ctx.ellipse(W / 2, H - 2.5, 3, 1.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(58,49,39,0.35)";
  ctx.fill();
}

/** Build every marker sprite (normal + active) as raw RGBA for map.addImage. */
export function buildMarkerSprites(): SpriteImage[] {
  const out: SpriteImage[] = [];
  const canvas = document.createElement("canvas");
  canvas.width = W * R;
  canvas.height = H * R;
  const ctx = canvas.getContext("2d");
  if (!ctx) return out;

  for (const cat of CATEGORIES) {
    for (const active of [false, true]) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(R, R);
      drawChip(ctx, cat.color, cat.icon, active);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      out.push({
        id: `pin-${cat.id}${active ? "-active" : ""}`,
        width: canvas.width,
        height: canvas.height,
        data: new Uint8Array(img.data.buffer.slice(0)),
        pixelRatio: R,
      });
    }
  }
  return out;
}
