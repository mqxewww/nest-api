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
    it("should find the user and an expired request, then send him an email", async () => {
      const user = getMockedUser();
      const existingRequest = getMockedResetPasswordRequest({
        verification_code_generated_at: moment().toDate()
      });

      em.findOne.mockReturnValueOnce(user);
      em.findOne.mockReturnValueOnce(existingRequest);
    });

    it("should find the user and a too recent request, throws a RESET_PASSWORD_REQUEST_IN_PROGRESS exception", async () => {
      const user = getMockedUser();
      const existingRequest = getMockedResetPasswordRequest({
        verification_code_generated_at: moment().toDate()
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

    it("should not find a user and so not send an email", () => {
      em.findOne.mockReturnValue(null);

      const result = service.sendRequest({ email: "" });

      expect(result).toBeInstanceOf(SentResetRequestDataDTO);
      expect(result).toEqual(SentResetRequestDataDTO.build(false, false));
    });
  });
});
