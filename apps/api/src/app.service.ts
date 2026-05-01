import { Injectable } from "@nestjs/common";
import type { HealthStatus } from "@jp2/shared-types";
import { parseRuntimeMode } from "@jp2/shared-validation";

@Injectable()
export class AppService {
  getHealth(mode = process.env.APP_RUNTIME_MODE, nodeEnv = process.env.NODE_ENV): HealthStatus {
    return {
      app: "api",
      runtimeMode: parseRuntimeMode(mode, { nodeEnv }),
      status: "ok"
    };
  }
}
