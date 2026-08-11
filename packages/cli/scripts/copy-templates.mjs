import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// templates/ vive na raiz do monorepo (fonte única, editável);
// aqui copiamos pra dentro do pacote pra ele ficar autossuficiente quando publicado no npm.
const source = path.resolve(__dirname, "../../../templates");
const destination = path.resolve(__dirname, "../templates");

await fs.remove(destination);
await fs.copy(source, destination);

console.log(`Templates copiados de ${source} para ${destination}`);
