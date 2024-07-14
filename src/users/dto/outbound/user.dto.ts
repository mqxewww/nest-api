import { User } from "~routes/users/entities/user.entity";

export class UserDTO {
  public constructor(
    public readonly uuid: string,
    public readonly first_name: string,
    public readonly last_name: string,
    public readonly email: string,
    public readonly login: string,
    public readonly avatar_uuid: string | null
  ) {}

  public static build(user: User): UserDTO {
    return new UserDTO(
      user.uuid,
      user.first_name,
      user.last_name,
      user.email,
      user.login,
      user.avatar ? user.avatar.uuid : null
    );
  }
}
