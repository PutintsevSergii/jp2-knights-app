import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

export function buildOpenApiConfig() {
  return new DocumentBuilder()
    .setTitle("JP2 Knights API")
    .setDescription("V1 REST API for the JP2 Knights app ecosystem.")
    .setVersion("0.1.0")
    .build();
}

/* v8 ignore start */
export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");

  const document = SwaggerModule.createDocument(app, buildOpenApiConfig());
  SwaggerModule.setup("api/docs", app, document);

  const port = Number.parseInt(process.env.API_PORT ?? "3000", 10);
  await app.listen(port);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await bootstrap();
}
/* v8 ignore stop */
