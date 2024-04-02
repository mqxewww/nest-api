export class VerifiedCodeDTO {
  public constructor(public readonly verification_code: string) {}

  public static build(verification_code: string): VerifiedCodeDTO {
    return new VerifiedCodeDTO(verification_code);
  }
}
