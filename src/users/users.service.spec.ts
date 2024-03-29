/* eslint-disable sonarjs/no-duplicate-string */

import { EntityManager } from "@mikro-orm/mysql";
import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ApiError } from "../common/constants/api-errors.constant";
import { EntitiesAndCountDTO } from "../common/dto/outbound/entities-and-count.dto";
import { EntityManagerMock } from "../common/mocks/entity-manager.mock";
import { NodeMailerMock } from "../common/mocks/node-mailer.mock";
import { NodeMailerService } from "../common/providers/node-mailer.provider";
import { PatchUserQueryDTO } from "./dto/inbound/patch-user-query.dto";
import { UserDTO } from "./dto/outbound/user.dto";
import { getMockedUser } from "./mocks/user-entity.mock";
import { UsersService } from "./users.service";

describe("UsersService - users.service.ts", () => {
  let service: UsersService;
  let emMock: typeof EntityManagerMock;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: EntityManager, useValue: EntityManagerMock },
        { provide: NodeMailerService, useClass: NodeMailerMock }
      ]
    }).compile();

    service = module.get(UsersService);
    emMock = module.get(EntityManager);
  });

  describe("find", () => {
    it("should return users and count", async () => {
      const users = [getMockedUser(), getMockedUser()];
      const count = 5;

      emMock.find.mockReturnValue(users);
      emMock.count.mockReturnValue(count);

      const result = await service.find({});

      expect(result).toBeInstanceOf(EntitiesAndCountDTO);
      expect(result).toEqual(
        EntitiesAndCountDTO.build(
          users.map((user) => UserDTO.build(user)),
          count
        )
      );
    });
  });

  describe("find-one", () => {
    it("should return one user", async () => {
      const user = getMockedUser();

      emMock.findOne.mockReturnValue(user);

      const result = await service.findOne("");

      expect(result).toBeInstanceOf(UserDTO);
      expect(result).toEqual(UserDTO.build(user));
    });

    it("should throw a NotFoundException", async () => {
      emMock.findOne.mockReturnValue(false);

      try {
        await service.findOne("");

        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.response).toEqual(ApiError.USER_NOT_FOUND);
      }
    });
  });

  describe("me", () => {
    it("should return the authenticated user", async () => {
      const user = getMockedUser();

      emMock.findOneOrFail.mockReturnValue(user);

      const result = await service.me("");

      expect(result).toBeInstanceOf(UserDTO);
      expect(result).toEqual(UserDTO.build(user));
    });
  });

  describe("patch-one", () => {
    it("should patch user and return updated user", async () => {
      const userQuery = getMockedUser();
      const query: PatchUserQueryDTO = {
        first_name: userQuery.first_name,
        last_name: userQuery.last_name
      };

      const existingUser = getMockedUser();
      const updatedUser: typeof existingUser = {
        ...existingUser,
        ...query,
        login: userQuery.login
      };

      EntityManagerMock.findOne.mockReturnValue(existingUser);
      EntityManagerMock.persistAndFlush.mockReturnValue(updatedUser);

      jest.mock("../common/helpers/user.helper", () => ({
        formatUserLogin: jest.fn().mockReturnValue(userQuery.login)
      }));

      const result = await service.patchOne("", query);

      expect(result).toBeInstanceOf(UserDTO);
      expect(result).toEqual(UserDTO.build(updatedUser));
    });

    it("should throw a NotFoundException", async () => {
      emMock.findOne.mockReturnValue(false);

      try {
        await service.patchOne("", {});

        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.response).toEqual(ApiError.USER_NOT_FOUND);
      }
    });
  });

  describe("delete-one", () => {
    it("should return true", async () => {
      emMock.findOne.mockReturnValue(getMockedUser());

      const result = await service.deleteOne("");

      expect(result).toEqual(true);
    });

    it("should throw a NotFoundException", async () => {
      emMock.findOne.mockReturnValue(false);

      try {
        await service.deleteOne("");

        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.response).toEqual(ApiError.USER_NOT_FOUND);
      }
    });
  });
});
