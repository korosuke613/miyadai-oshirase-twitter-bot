import { ensureFile } from "../deps.ts";

export const downloadPdf = async (pdfLink: string, filePath: string) => {
  const resp = await fetch(pdfLink);
  if (resp?.body === null) {
    throw new Error("resp is null");
  }
  const dest = filePath;

  await ensureFile(dest);
  const file = await Deno.open(dest, { truncate: true, write: true });
  await resp.body.pipeTo(file.writable);
};

export const convertPng = async (filePath: string) => {
  const outputFile = filePath.replace(".pdf", "");

  const command = await Deno.run({
    cmd: ["pdftoppm", filePath, "-png", "-singlefile", outputFile],
  });
  const status = await command.status();
  console.log(status);
};
