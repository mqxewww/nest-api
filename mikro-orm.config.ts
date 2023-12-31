import { defineConfig } from "@mikro-orm/core";
import { NotFoundException } from "@nestjs/common";
import { config } from "dotenv";

// Required when running commands from MikroORM CLI.
config({ path: "./config/.env" });

export default defineConfig({
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  dbName: process.env.DATABASE_NAME,
  entities: ["./dist/**/entities/*.entity.js"],
  entitiesTs: ["./src/**/entities/*.entity.ts"],
  allowGlobalContext: false,
  timezone: "+00:00",
  findOneOrFailHandler: (entityName: string) => {
    throw new NotFoundException(`${entityName} not found`);
  }
});
