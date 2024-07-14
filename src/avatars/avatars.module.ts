import { Module } from "@nestjs/common";
import { AvatarsController } from "~routes/avatars/avatars.controller";
import { AvatarsService } from "~routes/avatars/avatars.service";

@Module({
  controllers: [AvatarsController],
  providers: [AvatarsService]
})
export class AvatarsModule {}
