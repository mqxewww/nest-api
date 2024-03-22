import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ReadStream, createReadStream, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { ApiError } from "../common/constants/api-errors.constant";
import { User } from "../users/entities/user.entity";
import { Avatar } from "./entities/avatar.entity";

@Injectable()
export class AvatarsService {
  public constructor(private readonly em: EntityManager) {}

  public async getAvatar(avatar_uuid: string): Promise<ReadStream> {
    const avatar = await this.em.findOne(Avatar, { uuid: avatar_uuid });

    if (!avatar) throw new NotFoundException(ApiError.AVATAR_NOT_FOUND);

    return createReadStream(join(process.cwd(), `./uploads/avatars/${avatar.uuid}.jpg`));
  }

  public async uploadAvatar(
    user_uuid: string,
    file: Express.Multer.File
  ): Promise<{ uuid: string }> {
    const user = await this.em.findOneOrFail(User, { uuid: user_uuid }, { populate: ["avatar"] });

    if (user.avatar) {
      unlinkSync(`./uploads/avatars/${user.avatar.uuid}.jpg`);
      await this.em.removeAndFlush(user.avatar);
    }

    user.avatar = this.em.create(Avatar, { user });

    await this.em.persistAndFlush(user.avatar);

    writeFileSync(`./uploads/avatars/${user.avatar.uuid}.jpg`, file.buffer);

    return { uuid: user.avatar.uuid };
  }
}
