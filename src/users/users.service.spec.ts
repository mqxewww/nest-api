import { EntityManager } from "@mikro-orm/mysql";
import { Test } from "@nestjs/testing";
import { FindEntitiesQueryDTO } from "../common/dto/inbound/find-entities-query.dto";
import { EntitiesAndCountDTO } from "../common/dto/outbound/entities-and-count.dto";
import { EntityManagerMock } from "../common/mocks/entity-manager.mock";
import { NodeMailerMock } from "../common/mocks/node-mailer.mock";
import { NodeMailerService } from "../common/providers/node-mailer.provider";
import { UserDTO } from "./dto/outbound/user.dto";
import { getMockedUser } from "./mocks/user-entity.mock";
import { UsersService } from "./users.service";

describe("UsersService - users.service.ts", () => {
  let service: UsersService;
  let entityManagerMock: typeof EntityManagerMock;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: EntityManager, useValue: EntityManagerMock },
        { provide: NodeMailerService, useClass: NodeMailerMock }
      ]
    }).compile();

    service = module.get(UsersService);
    entityManagerMock = module.get(EntityManager);
  });

  describe("find", () => {
    it("should return EntitiesAndCountDTO<UserDTO>", async () => {
      const query: FindEntitiesQueryDTO = {};
      const users = [getMockedUser(), getMockedUser()];
      const count = 5;

      entityManagerMock.find.mockReturnValue(users);
      entityManagerMock.count.mockReturnValue(count);

      const result = await service.find(query);

      expect(result).toBeInstanceOf(EntitiesAndCountDTO);
      expect(result).toEqual(
        EntitiesAndCountDTO.build(
          users.map((user) => UserDTO.build(user)),
          count
        )
      );
    });
  });
});
