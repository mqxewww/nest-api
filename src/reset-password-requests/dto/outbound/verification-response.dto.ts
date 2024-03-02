export class VerificationResponseDTO {
  public readonly verification_key: string;

  public static from(verification_key: string): VerificationResponseDTO {
    return {
      verification_key
    };
  }
}
