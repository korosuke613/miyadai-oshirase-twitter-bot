import { convertPng, downloadPdf } from "../pdf.ts";

Deno.test("dummy", () => {
  let _ = downloadPdf;
  _ = convertPng;
});
