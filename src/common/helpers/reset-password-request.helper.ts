import { fakerFR as faker } from "@faker-js/faker";
import moment from "moment";
import { TokenCharset, TokenHelper } from "~common/helpers/token.helper";
import { UserHelper } from "~common/helpers/user.helper";
import {
  IsolatedResetPasswordRequest,
  ResetPasswordRequest
} from "~routes/reset-password-requests/entities/reset-password-request.entity";

export class ResetPasswordRequestHelper {
  public static generateEntity(params?: Partial<ResetPasswordRequest>): ResetPasswordRequest {
    return {
      id: params?.id ?? faker.number.int(),
      uuid: params?.uuid ?? faker.string.uuid(),
      created_at: params?.created_at ?? moment().toDate(),
      updated_at: params?.updated_at ?? moment().toDate(),
      verification_code:
        params?.verification_code ?? TokenHelper.generate(6, TokenCharset.NUMBERS_ONLY),
      verification_code_generated_at: params?.verification_code_generated_at ?? moment().toDate(),
      update_key: params?.update_key ?? TokenHelper.generate(6, TokenCharset.NUMBERS_ONLY),
      update_key_generated_at: params?.update_key_generated_at ?? moment().toDate(),
      user: params?.user ?? UserHelper.generateIsolatedEntity()
    };
  }

  public static generateIsolatedEntity(
    params?: Partial<IsolatedResetPasswordRequest>
  ): IsolatedResetPasswordRequest {
    return {
      id: params?.id ?? faker.number.int(),
      uuid: params?.uuid ?? faker.string.uuid(),
      created_at: params?.created_at ?? moment().toDate(),
      updated_at: params?.updated_at ?? moment().toDate(),
      verification_code:
        params?.verification_code ?? TokenHelper.generate(6, TokenCharset.NUMBERS_ONLY),
      verification_code_generated_at: params?.verification_code_generated_at ?? moment().toDate(),
      update_key: params?.update_key ?? TokenHelper.generate(6, TokenCharset.NUMBERS_ONLY),
      update_key_generated_at: params?.update_key_generated_at ?? moment().toDate()
    };
  }
}
