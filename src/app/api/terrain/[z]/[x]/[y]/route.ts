/**
 * Same-origin proxy for AWS Terrain Tiles (terrarium encoding).
 *
 * The upstream bucket serves no CORS headers, so MapLibre cannot read the
 * pixels directly. Proxying costs one hop and lets us cache aggressively.
 */
const UPSTREAM = "https://elevation-tiles-prod.s3.amazonaws.com/terrarium";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ z: string; x: string; y: string }> },
) {
  const { z, x, y } = await params;
  const zi = Number(z);
  const xi = Number(x);
  const yi = Number(y.replace(/\.png$/, ""));

  if (!Number.isInteger(zi) || !Number.isInteger(xi) || !Number.isInteger(yi) || zi < 0 || zi > 15) {
    return new Response("Bad tile coordinate", { status: 400 });
  }

  const upstream = await fetch(`${UPSTREAM}/${zi}/${xi}/${yi}.png`, {
    cache: "force-cache",
  });

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status === 404 ? 404 : 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=604800, s-maxage=2592000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
