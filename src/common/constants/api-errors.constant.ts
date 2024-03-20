type ApiErrorType = {
  name: ApiErrorName;
  message: string;
};

export enum ApiErrorName {
  ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",
  EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE",
  UNHANDLED_DATABASE_ERROR = "UNHANDLED_DATABASE_ERROR",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  NON_MATCHING_TOKEN = "NON_MATCHING_TOKEN",
  INVALID_TOKEN = "INVALID_TOKEN",
  MISSING_TOKEN = "MISSING_TOKEN",
  RESET_PASSWORD_REQUEST_IN_PROGRESS = "RESET_PASSWORD_REQUEST_IN_PROGRESS",
  INVALID_VERIFICATION_CODE = "INVALID_VERIFICATION_CODE",
  EXPIRED_VERIFICATION_CODE = "EXPIRED_VERIFICATION_CODE",
  EMAIL_ERROR = "EMAIL_ERROR",
  INVALID_UPDATE_KEY = "INVALID_UPDATE_KEY",
  INVALID_OLD_PASSWORD = "INVALID_OLD_PASSWORD",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  AVATAR_NOT_FOUND = "AVATAR_NOT_FOUND"
}

export const ApiError: { [key in ApiErrorName]: ApiErrorType } = {
  [ApiErrorName.ENTITY_NOT_FOUND]: {
    name: ApiErrorName.ENTITY_NOT_FOUND,
    message: "An error occured while fetching the data."
  },
  [ApiErrorName.EMAIL_ALREADY_IN_USE]: {
    name: ApiErrorName.EMAIL_ALREADY_IN_USE,
    message: "This email is already in use, please add another one."
  },
  [ApiErrorName.UNHANDLED_DATABASE_ERROR]: {
    name: ApiErrorName.UNHANDLED_DATABASE_ERROR,
    message: "An unhandled database error has occured, please try again now or later."
  },
  [ApiErrorName.INVALID_CREDENTIALS]: {
    name: ApiErrorName.INVALID_CREDENTIALS,
    message: "Invalid credentials, verify and try again."
  },
  [ApiErrorName.NON_MATCHING_TOKEN]: {
    name: ApiErrorName.NON_MATCHING_TOKEN,
    message: "The given token does not correspond to the one associated with your account."
  },
  [ApiErrorName.INVALID_TOKEN]: {
    name: ApiErrorName.INVALID_TOKEN,
    message: "The given token is invalid, get a new one via auth/login."
  },
  [ApiErrorName.MISSING_TOKEN]: {
    name: ApiErrorName.MISSING_TOKEN,
    message: "Missing (bearer) access token, get one via auth/login."
  },
  [ApiErrorName.RESET_PASSWORD_REQUEST_IN_PROGRESS]: {
    name: ApiErrorName.RESET_PASSWORD_REQUEST_IN_PROGRESS,
    message: "A reset password request is already in progress, please try again later."
  },
  [ApiErrorName.INVALID_VERIFICATION_CODE]: {
    name: ApiErrorName.INVALID_VERIFICATION_CODE,
    message: "The verification code entered is invalid, please verify and try again."
  },
  [ApiErrorName.EXPIRED_VERIFICATION_CODE]: {
    name: ApiErrorName.EXPIRED_VERIFICATION_CODE,
    message: "Your reset password request has expired, please make a new request."
  },
  [ApiErrorName.EMAIL_ERROR]: {
    name: ApiErrorName.EMAIL_ERROR,
    message: "An error occured while sending the email, please try again later."
  },
  [ApiErrorName.INVALID_UPDATE_KEY]: {
    name: ApiErrorName.INVALID_UPDATE_KEY,
    message: "The update key is invalid, please verify and try again."
  },
  [ApiErrorName.INVALID_OLD_PASSWORD]: {
    name: ApiErrorName.INVALID_OLD_PASSWORD,
    message: "Your old password is invalid. Verify and try again."
  },
  [ApiErrorName.USER_NOT_FOUND]: {
    name: ApiErrorName.USER_NOT_FOUND,
    message: "No user with this login or UUID was found."
  },
  [ApiErrorName.AVATAR_NOT_FOUND]: {
    name: ApiErrorName.AVATAR_NOT_FOUND,
    message: "No avatar with this uuid was found."
  }
};
