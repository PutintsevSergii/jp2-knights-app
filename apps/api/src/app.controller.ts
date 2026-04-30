import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { HealthStatus } from "@jp2/shared-types";
import { AppService } from "./app.service.js";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOkResponse({
    description: "API health status for launch and smoke checks."
  })
  getHealth(): HealthStatus {
    return this.appService.getHealth();
  }
}
