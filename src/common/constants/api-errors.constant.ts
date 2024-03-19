type ApiErrorType = {
  name: ApiErrorName;
  message: string;
};

export enum ApiErrorName {
  EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE",
  UNHANDLED_DATABASE_ERROR = "UNHANDLED_DATABASE_ERROR",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
}

export const ApiError: { [key in ApiErrorName]: ApiErrorType } = {
  [ApiErrorName.EMAIL_ALREADY_IN_USE]: {
    name: ApiErrorName.EMAIL_ALREADY_IN_USE,
    message: "This email is already in use, please add another one."
  },
  [ApiErrorName.UNHANDLED_DATABASE_ERROR]: {
    name: ApiErrorName.UNHANDLED_DATABASE_ERROR,
    message: "An unhandled database error has occured. Please try again now or later."
  },
  [ApiErrorName.INVALID_CREDENTIALS]: {
    name: ApiErrorName.INVALID_CREDENTIALS,
    message: "Invalid credentials. Verify and try again."
  }
};
