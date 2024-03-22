export class SentResetRequestDataDTO {
  public constructor(
    public readonly user_exists: boolean,
    public readonly email_sent: boolean
  ) {}

  public static build(user_exists: boolean, email_sent: boolean): SentResetRequestDataDTO {
    return new SentResetRequestDataDTO(user_exists, email_sent);
  }
}
