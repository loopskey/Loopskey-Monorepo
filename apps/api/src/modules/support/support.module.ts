import { ContactRateLimiterService } from "@support/services/contact-rate-limiter.service";
import { ContactInquiryService } from "@support/services/contact-inquiry.service";
import { ContactResolver } from "@support/resolvers/contact.resolver";
import { MailModule } from "@mail/mail.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [MailModule],
  providers: [
    ContactResolver,
    ContactInquiryService,
    ContactRateLimiterService,
  ],
})
export class SupportModule {}
