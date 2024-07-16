import { EntityManager } from "@mikro-orm/mysql";
import { HttpException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import moment from "moment";
import { ApiError } from "~common/constants/api-errors.constant";
import { ResetPasswordRequestHelper } from "~common/helpers/reset-password-request.helper";
import { UserHelper } from "~common/helpers/user.helper";
import { BcryptMock } from "~common/mocks/bcrypt.mock";
import { EntityManagerMock } from "~common/mocks/entity-manager.mock";
import { NodemailerMock } from "~common/mocks/nodemailer.mock";
import { SentResetRequestDataDTO } from "~routes/reset-password-requests/dto/outbound/sent-reset-request-data.dto";
import { VerifiedCodeDTO } from "~routes/reset-password-requests/dto/outbound/verified-code.dto";
import { ResetPasswordRequestsService } from "~routes/reset-password-requests/reset-password-requests.service";

describe("ResetPasswordRequestsService", () => {
  let em: EntityManagerMock;
  let service: ResetPasswordRequestsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: EntityManager, useClass: EntityManagerMock },
        { provide: "bcrypt", useClass: BcryptMock },
        { provide: "nodemailer", useClass: NodemailerMock },
        ResetPasswordRequestsService
      ]
    }).compile();

    em = module.get(EntityManager);
    service = module.get(ResetPasswordRequestsService);
  });

  describe("send-request", () => {
    describe("The user exists, but a reset password request already exist", () => {
      describe("The reset password request has expired", () => {
        it("should create a new verification code, then email it to the user", async () => {
          const user = UserHelper.generateIsolatedEntity({ email: "noizetmaxence@proton.me" });
          const existingRequest = ResetPasswordRequestHelper.generateIsolatedEntity({
            verification_code_generated_at: moment().subtract(601, "seconds").toDate()
          });
          const newRequest = ResetPasswordRequestHelper.generateIsolatedEntity();

          em.findOne.mockReturnValueOnce(user);
          em.findOne.mockReturnValueOnce(existingRequest);
          em.create.mockReturnValue(newRequest);

          const result = await service.sendRequest({ email: "" });

          expect(result).toBeInstanceOf(SentResetRequestDataDTO);
          expect(result).toEqual(SentResetRequestDataDTO.build(true, true));
        });
      });

      describe("The reset password request hasn't expired", () => {
        it("should throw an exception with RESET_PASSWORD_REQUEST_IN_PROGRESS response", async () => {
          const user = UserHelper.generateIsolatedEntity();
          const existingRequest = ResetPasswordRequestHelper.generateIsolatedEntity({
            verification_code_generated_at: moment().subtract(600, "seconds").toDate()
          });

          em.findOne.mockReturnValueOnce(user);
          em.findOne.mockReturnValueOnce(existingRequest);

          try {
            await service.sendRequest({ email: "" });
          } catch (err) {
            expect(err).toBeInstanceOf(HttpException);

            const httpException = err as HttpException;

            expect(httpException.getResponse()).toEqual(
              ApiError.RESET_PASSWORD_REQUEST_IN_PROGRESS
            );
          }
        });
      });
    });

    describe("The user exists and no reset password request exists", () => {
      it("should create the request, then email the verification code to the user", async () => {
        const user = UserHelper.generateIsolatedEntity();
        const newRequest = ResetPasswordRequestHelper.generateIsolatedEntity();

        em.findOne.mockReturnValueOnce(user);
        em.findOne.mockReturnValueOnce(null);
        em.create.mockReturnValue(newRequest);

        const result = await service.sendRequest({ email: "" });

        expect(result).toBeInstanceOf(SentResetRequestDataDTO);
        expect(result).toEqual(SentResetRequestDataDTO.build(true, true));
      });
    });

    describe("The user doesn't exist", () => {
      it("should return an object indicating that the user does not exist", async () => {
        em.findOne.mockReturnValue(null);

        const result = await service.sendRequest({ email: "" });

        expect(result).toBeInstanceOf(SentResetRequestDataDTO);
        expect(result).toEqual(SentResetRequestDataDTO.build(false, false));
      });
    });
  });

  describe("verify-code", () => {
    describe("The request is found and the verification code is correct", () => {
      describe("The request has expired", () => {
        it("should throw an exception with EXPIRED_VERIFICATION_CODE response", async () => {
          const expiredRequest = ResetPasswordRequestHelper.generateIsolatedEntity({
            verification_code_generated_at: moment().subtract(601, "seconds").toDate()
          });

          em.findOne.mockReturnValue(expiredRequest);

          try {
            await service.verifyCode({ email: "", verification_code: "" });
          } catch (err) {
            expect(err).toBeInstanceOf(HttpException);

            const httpException = err as HttpException;

            expect(httpException.getResponse()).toEqual(ApiError.EXPIRED_VERIFICATION_CODE);
          }
        });
      });

      describe("The request hasn't expired", () => {
        it("should return the update key to the user", async () => {
          const request = ResetPasswordRequestHelper.generateIsolatedEntity();

          em.findOne.mockReturnValue(request);

          const result = await service.verifyCode({ email: "", verification_code: "" });

          expect(result).toBeInstanceOf(VerifiedCodeDTO);
        });
      });
    });

    describe("The request isn't found or the verification code is incorrect", () => {
      it("should throw an exception with INVALID_VERIFICATION_CODE response", async () => {
        em.findOne.mockReturnValue(null);

        try {
          await service.verifyCode({ email: "", verification_code: "" });
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);

          const httpException = err as HttpException;

          expect(httpException.getResponse()).toEqual(ApiError.INVALID_VERIFICATION_CODE);
        }
      });
    });
  });

  describe("update-user-password", () => {
    describe("The request is found and the update key is correct", () => {
      describe("The request has expired", () => {
        it("should throw an exception with EXPIRED_VERIFICATION_CODE response", async () => {
          const expiredRequest = ResetPasswordRequestHelper.generateIsolatedEntity({
            update_key_generated_at: moment().subtract(601, "seconds").toDate()
          });

          em.findOne.mockReturnValue(expiredRequest);

          try {
            await service.updateUserPassword({ password: "", update_key: "" });
          } catch (err) {
            expect(err).toBeInstanceOf(HttpException);

            const httpException = err as HttpException;

            expect(httpException.getResponse()).toEqual(ApiError.EXPIRED_VERIFICATION_CODE);
          }
        });
      });

      describe("The request hasn't expired", () => {
        it("should update the user password", async () => {
          const user = UserHelper.generateIsolatedEntity();
          const request = ResetPasswordRequestHelper.generateEntity({
            update_key_generated_at: moment().subtract(600, "seconds").toDate(),
            user
          });

          em.findOne.mockReturnValue(request);

          const result = await service.updateUserPassword({ password: "", update_key: "" });

          expect(result).toEqual(true);
        });
      });
    });

    describe("The request isn't found or the update key is incorrect", () => {
      it("should throw an exception with INVALID_UPDATE_KEY response", async () => {
        em.findOne.mockReturnValue(null);

        try {
          await service.updateUserPassword({ password: "", update_key: "" });
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);

          const httpException = err as HttpException;

          expect(httpException.getResponse()).toEqual(ApiError.INVALID_UPDATE_KEY);
        }
      });
    });
  });
});
