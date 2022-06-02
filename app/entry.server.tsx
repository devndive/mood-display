import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");
  responseHeaders.set("Content-Security-Policy", "frame-ancestors 'self'; block-all-mixed-content; default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-src 'self'; child-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; manifest-src 'self'; form-action 'self'; media-src 'self'; prefetch-src 'self'; worker-src 'self'");
  responseHeaders.set("X-Frame-Options", "DENY");
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("X-Xss-Protection", "1; mode=block");
  responseHeaders.set("Referrer-Policy", "no-referrer-when-downgrade");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
