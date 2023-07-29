import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { User } from "./entities/user.entity";

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [],
  providers: []
})
export class UsersModule {}
