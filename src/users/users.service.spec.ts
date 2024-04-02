/* eslint-disable sonarjs/no-duplicate-string */

import { EntityManager } from "@mikro-orm/mysql";
import { HttpException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ApiError } from "../common/constants/api-errors.constant";
import { EntitiesAndCountDTO } from "../common/dto/outbound/entities-and-count.dto";
import { BcryptMock } from "../common/mocks/bcrypt.mock";
import { EntityManagerMock } from "../common/mocks/entity-manager.mock";
import { NodemailerMock } from "../common/mocks/nodemailer.mock";
import { PatchUserQueryDTO } from "./dto/inbound/patch-user-query.dto";
import { UserDTO } from "./dto/outbound/user.dto";
import { getMockedUser } from "./mocks/user-entity.mock";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let bcrypt: BcryptMock;
  let em: EntityManagerMock;
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: "nodemailer", useClass: NodemailerMock },
        { provide: "bcrypt", useClass: BcryptMock },
        { provide: EntityManager, useClass: EntityManagerMock },
        UsersService
      ]
    }).compile();

    bcrypt = module.get("bcrypt");
    em = module.get(EntityManager);
    service = module.get(UsersService);
  });

  describe("find", () => {
    it("should return users and database count", async () => {
      const users = [getMockedUser(), getMockedUser()];
      const count = 5;

      em.find.mockReturnValue(users);
      em.count.mockReturnValue(count);

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
    describe("A user exists with the UUID or login given", () => {
      it("should return the user as UserDTO", async () => {
        const user = getMockedUser();

        em.findOne.mockReturnValue(user);

        const result = await service.findOne("");

        expect(result).toBeInstanceOf(UserDTO);
        expect(result).toEqual(UserDTO.build(user));
      });
    });

    describe("No user exists with the UUID or login given", () => {
      it("should throw an USER_NOT_FOUND exception", async () => {
        em.findOne.mockReturnValue(null);

        try {
          await service.findOne("");
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.response).toEqual(ApiError.USER_NOT_FOUND);
        }
      });
    });
  });

  describe("me", () => {
    it("should return the authenticated user as UserDTO", async () => {
      const user = getMockedUser();

      em.findOneOrFail.mockReturnValue(user);

      const result = await service.me("");

      expect(result).toBeInstanceOf(UserDTO);
      expect(result).toEqual(UserDTO.build(user));
    });
  });

  describe("patch-one", () => {
    describe("The user exists", () => {
      it("should update the user and return it as UserDTO", async () => {
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

        em.findOne.mockReturnValue(existingUser);
        em.persistAndFlush.mockReturnValue(updatedUser);

        jest.mock("../common/helpers/user.helper", () => ({
          formatUserLogin: jest.fn().mockReturnValue(userQuery.login)
        }));

        const result = await service.patchOne("", query);

        expect(result).toBeInstanceOf(UserDTO);
        expect(result).toEqual(UserDTO.build(updatedUser));
      });
    });

    describe("The user doesn't exist", () => {
      it("should throw an USER_NOT_FOUND exception", async () => {
        em.findOne.mockReturnValue(null);

        try {
          await service.patchOne("", {});
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.response).toEqual(ApiError.USER_NOT_FOUND);
        }
      });
    });
  });

  describe("change-password", () => {
    describe("Comparison of the user's old password fails", () => {
      it("should throw an INVALID_OLD_PASSWORD exception", async () => {
        em.findOneOrFail.mockReturnValue(getMockedUser());
        bcrypt.compareSync.mockReturnValue(false);

        try {
          await service.changePassword("", { old_password: "", new_password: "" });
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.response).toEqual(ApiError.INVALID_OLD_PASSWORD);
        }
      });
    });

    describe("Comparison of the user's old password is successful", () => {
      it("should update his password and return true", async () => {
        const user = getMockedUser();

        em.findOneOrFail.mockReturnValue(user);
        em.persistAndFlush.mockReturnValue(user);

        bcrypt.compareSync.mockReturnValue(true);
        bcrypt.hashSync.mockReturnValue("");

        const result = await service.changePassword(user.uuid, {
          old_password: "",
          new_password: ""
        });

        expect(result).toEqual(true);
      });
    });
  });

  describe("delete-one", () => {
    describe("The user exists", () => {
      it("should delete the user and then return true", async () => {
        em.findOne.mockReturnValue(getMockedUser());

        const result = await service.deleteOne("");

        expect(result).toEqual(true);
      });
    });

    describe("The user doesn't exist", () => {
      it("should throw an USER_NOT_FOUND exception", async () => {
        em.findOne.mockReturnValue(null);

        try {
          await service.deleteOne("");
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.response).toEqual(ApiError.USER_NOT_FOUND);
        }
      });
    });
  });
});
