import { cp, copyFile, mkdir, rm } from "node:fs/promises";

const outputDirectory = new URL("./dist/", import.meta.url);
const publicFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "manifest.webmanifest",
  "service-worker.js",
  "informe-incidentes.html",
  "informe-incidentes.css",
  "informe-incidentes.js",
  "mantenimiento-control.html",
  "mantenimiento-control.css",
  "mantenimiento-control.js",
  "asistencia.html",
  "asistencia.css",
  "asistencia-status.css",
  "asistencia.js",
  "gdh.html",
  "gdh.css",
  "gdh-media.css",
  "gdh-expedientes.css",
  "gdh-evaluaciones.css",
  "gdh-evaluaciones.js",
  "gdh.js"
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of publicFiles) {
  await copyFile(new URL(`./${file}`, import.meta.url), new URL(file, outputDirectory));
}

await cp(new URL("./assets/", import.meta.url), new URL("assets/", outputDirectory), {
  recursive: true
});

console.log("Aplicacion URBAPARK preparada en dist/");
