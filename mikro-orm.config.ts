import { defineConfig } from "@mikro-orm/mysql";
import { SeedManager } from "@mikro-orm/seeder";
import { InternalServerErrorException } from "@nestjs/common";
import { config } from "dotenv";

// Required when running commands from MikroORM CLI
config({ path: "./config/.env" });

export default defineConfig({
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  dbName: process.env.DATABASE_NAME,
  entities: ["./src/**/entities/*.entity.js", "./dist/src/**/entities/*.entity.js"],
  entitiesTs: ["./src/**/entities/*.entity.ts"],
  extensions: [SeedManager],
  allowGlobalContext: false,
  timezone: "+00:00",
  findOneOrFailHandler: (entityName: string) => {
    throw new InternalServerErrorException(`${entityName} not found`);
  },
  persistOnCreate: false
});
