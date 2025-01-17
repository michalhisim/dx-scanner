import { ServiceError, ErrorCode } from '.';

export class ErrorFactory {
  static newInternalError(message: string = 'The app went broken. Sorry about that. Not your fault') {
    return new ServiceError({
      code: ErrorCode.INTERNAL_ERROR,
      message: message,
    });
  }

  static newArgumentError(message: string = 'Wrong arguments') {
    return new ServiceError({
      code: ErrorCode.ARGUMENT_ERROR,
      message: message,
    });
  }
}
