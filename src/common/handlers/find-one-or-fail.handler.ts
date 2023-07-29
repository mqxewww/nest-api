import { NotFoundException } from "@nestjs/common";

function findOneOrFailHandler(entityName: string): Error {
  throw new NotFoundException(`${entityName} not found`);
}

export default findOneOrFailHandler;
