import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Optional } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import {
  DATABASE_RUNTIME_CONFIG,
  connectWithRetry,
  createPrismaClientOptions,
  readDatabaseRuntimeConfig,
  type DatabaseRuntimeConfig
} from "./database-runtime.config.js";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
  private readonly runtimeConfig: DatabaseRuntimeConfig;

  constructor(
    @Optional()
    @Inject(DATABASE_RUNTIME_CONFIG)
    runtimeConfig?: DatabaseRuntimeConfig
  ) {
    const resolvedRuntimeConfig = runtimeConfig ?? readDatabaseRuntimeConfig();
    super(createPrismaClientOptions(resolvedRuntimeConfig));
    this.runtimeConfig = resolvedRuntimeConfig;
  }

  async onModuleInit(): Promise<void> {
    if (!this.runtimeConfig.connectOnBoot) {
      return;
    }

    await connectWithRetry(() => this.$connect(), {
      attempts: this.runtimeConfig.startupRetryAttempts,
      delayMs: this.runtimeConfig.startupRetryDelayMs
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
