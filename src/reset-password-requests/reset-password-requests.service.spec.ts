/* eslint-disable sonarjs/no-duplicate-string */

import { EntityManager } from "@mikro-orm/mysql";
import { HttpException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import moment from "moment";
import { ApiError } from "../common/constants/api-errors.constant";
import { BcryptMock } from "../common/mocks/bcrypt.mock";
import { EntityManagerMock } from "../common/mocks/entity-manager.mock";
import { NodemailerMock } from "../common/mocks/nodemailer.mock";
import { getMockedUser } from "../users/mocks/user-entity.mock";
import { SentResetRequestDataDTO } from "./dto/outbound/sent-reset-request-data.dto";
import { VerifiedCodeDTO } from "./dto/outbound/verified-code.dto";
import { getMockedResetPasswordRequest } from "./mocks/reset-password-request.mock";
import { ResetPasswordRequestsService } from "./reset-password-requests.service";

describe("ResetPasswordRequestsService", () => {
  let em: EntityManagerMock;
  let service: ResetPasswordRequestsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: "nodemailer", useClass: NodemailerMock },
        { provide: "bcrypt", useClass: BcryptMock },
        { provide: EntityManager, useClass: EntityManagerMock },
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
          const user = getMockedUser();
          const existingRequest = getMockedResetPasswordRequest({
            verification_code_generated_at: moment().subtract(601, "seconds").toDate()
          });
          const newRequest = getMockedResetPasswordRequest();

          em.findOne.mockReturnValueOnce(user);
          em.findOne.mockReturnValueOnce(existingRequest);
          em.create.mockReturnValue(newRequest);
          em.persistAndFlush.mockReturnValue(newRequest);

          const result = await service.sendRequest({ email: "" });

          expect(result).toBeInstanceOf(SentResetRequestDataDTO);
          expect(result).toEqual(SentResetRequestDataDTO.build(true, true));
        });
      });

      describe("The reset password request hasn't expired", () => {
        it("should throw a RESET_PASSWORD_REQUEST_IN_PROGRESS exception", async () => {
          const user = getMockedUser();
          const existingRequest = getMockedResetPasswordRequest({
            verification_code_generated_at: moment().subtract(5, "seconds").toDate()
          });

          em.findOne.mockReturnValueOnce(user);
          em.findOne.mockReturnValueOnce(existingRequest);

          try {
            await service.sendRequest({ email: "" });
          } catch (err) {
            expect(err).toBeInstanceOf(HttpException);
            expect(err.response).toEqual(ApiError.RESET_PASSWORD_REQUEST_IN_PROGRESS);
          }
        });
      });
    });

    describe("The user exists and no reset password request exists", () => {
      it("should create the request, then email the verification code to the user", async () => {
        const user = getMockedUser();
        const newRequest = getMockedResetPasswordRequest();

        em.findOne.mockReturnValueOnce(user);
        em.findOne.mockReturnValueOnce(null);
        em.create.mockReturnValue(newRequest);
        em.persistAndFlush.mockReturnValue(newRequest);

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
        it("should throw an EXPIRED_VERIFICATION_CODE exception", async () => {
          const request = getMockedResetPasswordRequest({
            verification_code_generated_at: moment().subtract(601, "seconds").toDate()
          });

          em.findOne.mockReturnValue(request);

          try {
            await service.verifyCode({ email: "", verification_code: "" });
          } catch (err) {
            expect(err).toBeInstanceOf(HttpException);
            expect(err.response).toEqual(ApiError.EXPIRED_VERIFICATION_CODE);
          }
        });
      });

      describe("The request hasn't expired", () => {
        it("should return the update key to the user", async () => {
          const request = getMockedResetPasswordRequest();

          em.findOne.mockReturnValue(request);
          em.persistAndFlush.mockReturnValue(request);

          const result = await service.verifyCode({ email: "", verification_code: "" });

          expect(result).toBeInstanceOf(VerifiedCodeDTO);
        });
      });
    });

    describe("The request isn't found or the verification code is incorrect", () => {
      it("should throw an INVALID_VERIFICATION_CODE", async () => {
        em.findOne.mockReturnValue(null);

        try {
          await service.verifyCode({ email: "", verification_code: "" });
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.response).toEqual(ApiError.INVALID_VERIFICATION_CODE);
        }
      });
    });
  });
});
