import { ArgumentsHost, BadRequestException, Catch } from "@nestjs/common";
import { HttpException, PayloadTooLargeException } from "@nestjs/common";
import { MAX_SOCIAL_IMAGE_SIZE_BYTES } from "@contentMedia/enums/content-social-image.constant";
import { ContentSeoMessageCode } from "@loopskey/api-contracts/error-codes";
import { BaseExceptionFilter } from "@nestjs/core";
import { MulterError } from "multer";

const megabytes = Math.round(MAX_SOCIAL_IMAGE_SIZE_BYTES / (1024 * 1024));

const isTooLarge = (exception: MulterError | HttpException) =>
  exception instanceof PayloadTooLargeException ||
  (exception instanceof MulterError && exception.code === "LIMIT_FILE_SIZE");

@Catch(MulterError, PayloadTooLargeException)
export class ContentSocialImageErrorFilter extends BaseExceptionFilter {
  catch(exception: MulterError | HttpException, host: ArgumentsHost) {
    const payload = isTooLarge(exception)
      ? {
          code: ContentSeoMessageCode.IMAGE_TOO_LARGE,
          message: `A social image is at most ${megabytes} MB.`,
        }
      : {
          code: ContentSeoMessageCode.IMAGE_INVALID_TYPE,
          message: "That file cannot be used as a social image.",
        };

    super.catch(new BadRequestException(payload), host);
  }
}
