import { User } from "../../entities/user.entity";

export class UserDTO {
  public uuid: string;
  public first_name: string;
  public last_name: string;
  public login: string;
  public avatar_uuid: string | null;

  public static from(user: User): UserDTO {
    return {
      uuid: user.uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      login: user.login,
      avatar_uuid: user.avatar?.uuid ?? null
    };
  }
}
