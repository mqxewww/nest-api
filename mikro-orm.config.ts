import { defineConfig } from "@mikro-orm/core";
import findOneOrFailHandler from "~common/handlers/find-one-or-fail.handler";

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
  findOneOrFailHandler: findOneOrFailHandler
});
