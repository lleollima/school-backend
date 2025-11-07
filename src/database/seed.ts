import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envConfig } from '../configs/env.config';
import { SeederModule } from './seeders/seeder.module';
import { SeederService } from './seeders/seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.url'),
      }),
      inject: [ConfigService],
    }),
    SeederModule,
  ],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(SeederService);
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'seed':
        await seeder.seedAll();
        break;
      case 'drop':
        await seeder.dropAll();
        break;
      case 'reset':
        await seeder.resetAll();
        break;
      default:
        console.log(`
🌱 Database Seeder

Usage:
  pnpm seed              - Run all seeders
  pnpm seed:drop         - Drop all seeded data
  pnpm seed:reset        - Drop and reseed all data

Available commands:
  seed       Execute all seeders sequentially
  drop       Remove all seeded data
  reset      Drop and reseed (fresh start)
        `);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();

