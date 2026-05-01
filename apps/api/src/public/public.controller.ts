import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { publicHomeQuerySchema } from "@jp2/shared-validation";
import { ZodValidationPipe } from "../validation/zod-validation.pipe.js";
import { publicHomeResponseOpenApiSchema } from "./public.openapi.js";
import { PublicHomeService } from "./public-home.service.js";
import type { PublicHomeQuery, PublicHomeResponse } from "./public.types.js";

@ApiTags("public")
@Controller("public")
export class PublicController {
  constructor(private readonly publicHomeService: PublicHomeService) {}

  @Get("home")
  @ApiOkResponse({
    description: "Public home discovery payload with no private content.",
    schema: publicHomeResponseOpenApiSchema
  })
  @ApiQuery({
    name: "language",
    required: false,
    schema: { type: "string", minLength: 2, maxLength: 10 }
  })
  getPublicHome(
    @Query(new ZodValidationPipe(publicHomeQuerySchema)) query: PublicHomeQuery
  ): PublicHomeResponse {
    return this.publicHomeService.getHome(query);
  }
}
