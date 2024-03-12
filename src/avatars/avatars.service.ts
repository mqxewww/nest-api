import { EntityManager } from "@mikro-orm/mysql";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ReadStream, createReadStream, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { User } from "../users/entities/user.entity";
import { Avatar } from "./entities/avatar.entity";

@Injectable()
export class AvatarsService {
  public constructor(private readonly em: EntityManager) {}

  public async getAvatar(uuid: string): Promise<ReadStream> {
    const avatar = await this.em.findOne(Avatar, { uuid });

    if (!avatar) throw new BadRequestException("No avatar registered with this UUID.");

    return createReadStream(join(process.cwd(), `./uploads/avatars/${avatar.uuid}.jpg`));
  }

  public async uploadAvatar(uuid: string, file: Express.Multer.File): Promise<boolean> {
    const user = await this.em.findOneOrFail(User, { uuid }, { populate: ["avatar"] });

    if (user.avatar) {
      unlinkSync(`./uploads/avatars/${user.avatar.uuid}.jpg`);
      await this.em.removeAndFlush(user.avatar);
    }

    user.avatar = this.em.create(Avatar, { user });

    await this.em.persistAndFlush(user.avatar);

    writeFileSync(`./uploads/avatars/${user.avatar.uuid}.jpg`, file.buffer);

    return true;
  }
}
