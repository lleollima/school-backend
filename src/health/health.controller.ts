import { Controller, Get } from '@nestjs/common';
import { MongooseHealthIndicator } from '@nestjs/terminus';

interface HealthResponse {
  status: string;
  database: {
    mongodb: string;
  };
}

@Controller('health')
export class HealthController {
  constructor(private mongooseHealth: MongooseHealthIndicator) {}

  @Get()
  async check(): Promise<HealthResponse> {
    try {
      await this.mongooseHealth.pingCheck('mongodb');

      return {
        status: 'online',
        database: {
          mongodb: 'online',
        },
      };
    } catch (error) {
      return {
        status: 'offline',
        database: {
          mongodb: 'offline',
        },
      };
    }
  }
}

