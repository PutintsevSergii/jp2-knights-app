import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule } from "@nestjs/swagger";

const appModuleUrl = pathToFileURL(`${process.cwd()}/apps/api/dist/app.module.js`).href;
const mainModuleUrl = pathToFileURL(`${process.cwd()}/apps/api/dist/main.js`).href;

const [{ AppModule }, { buildOpenApiConfig }] = await Promise.all([
  import(appModuleUrl),
  import(mainModuleUrl)
]);

const app = await NestFactory.create(AppModule, { logger: false });
app.setGlobalPrefix("api");

const document = SwaggerModule.createDocument(app, buildOpenApiConfig());
document.openapi = "3.1.0";
mkdirSync("generated", { recursive: true });
writeFileSync("generated/openapi.json", `${JSON.stringify(document, null, 2)}\n`);
await app.close();

console.log("Generated generated/openapi.json.");
