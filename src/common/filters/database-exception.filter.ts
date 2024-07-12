import {
  NotNullConstraintViolationException,
  UniqueConstraintViolationException
} from "@mikro-orm/core";
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { ApiError } from "../constants/api-errors.constant";

@Catch(UniqueConstraintViolationException, NotNullConstraintViolationException)
export class DatabaseExceptionFilter implements ExceptionFilter {
  public catch(_: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(ApiError.UNHANDLED_DATABASE_ERROR);
  }
}
