import { ArgumentsHost, BadRequestException, Catch } from "@nestjs/common";
import { HttpException, PayloadTooLargeException } from "@nestjs/common";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { BaseExceptionFilter } from "@nestjs/core";
import { MAX_LOGO_SIZE_BYTES } from "@association/enums/association-logo.constant";
import { MulterError } from "multer";

const megabytes = Math.round(MAX_LOGO_SIZE_BYTES / (1024 * 1024));

const isTooLarge = (exception: MulterError | HttpException) =>
  exception instanceof PayloadTooLargeException ||
  (exception instanceof MulterError && exception.code === "LIMIT_FILE_SIZE");

@Catch(MulterError, PayloadTooLargeException)
export class AssociationUploadErrorFilter extends BaseExceptionFilter {
  catch(exception: MulterError | HttpException, host: ArgumentsHost) {
    const payload = isTooLarge(exception)
      ? {
          code: AssociationMessageCode.LOGO_TOO_LARGE,
          message: `A logo is at most ${megabytes} MB.`,
        }
      : {
          code: AssociationMessageCode.LOGO_INVALID_TYPE,
          message: "That file cannot be used as a logo.",
        };

    super.catch(new BadRequestException(payload), host);
  }
}
