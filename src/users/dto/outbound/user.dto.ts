import { User } from "../../entities/user.entity";

export class UserDTO {
  public id: number;
  public uuid: string;
  public first_name: string;
  public last_name: string;
  public login: string;

  public static fromEntity(user: User): UserDTO {
    return {
      id: user.id,
      uuid: user.uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      login: user.login
    };
  }
}