import { fakerFR as faker } from "@faker-js/faker";
import moment from "moment";
import { TokenCharset, TokenHelper } from "../../common/helpers/token.helper";
import { ResetPasswordRequest } from "../entities/reset-password-request.entity";

type ResetPasswordRequestMock = Omit<ResetPasswordRequest, "user">;

export function getMockedResetPasswordRequest(
  params?: Partial<ResetPasswordRequest>
): ResetPasswordRequestMock {
  return {
    id: params?.id ?? faker.number.int(),
    uuid: params?.uuid ?? faker.string.uuid(),
    created_at: params?.created_at ?? moment().toDate(),
    updated_at: params?.updated_at ?? moment().toDate(),
    verification_code:
      params?.verification_code ?? TokenHelper.generate(6, TokenCharset.NUMBERS_ONLY),
    verification_code_generated_at: params?.verification_code_generated_at ?? moment().toDate()
  };
}
