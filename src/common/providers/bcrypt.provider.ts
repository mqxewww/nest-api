import { Module } from "@nestjs/common";
import bcrypt from "bcrypt";

export type Bcrypt = typeof bcrypt;

@Module({
  providers: [
    {
      provide: "bcrypt",
      useValue: bcrypt
    }
  ],
  exports: ["bcrypt"]
})
export class BcryptModule {}
