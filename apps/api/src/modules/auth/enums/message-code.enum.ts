/**
 * Re-exported from the shared contract package so the frontend branches on the
 * same values the API throws. The import path here is unchanged, so every
 * existing `@auth/enums/message-code.enum` import keeps working.
 */
export { AuthMessageCode } from "@loopskey/api-contracts/error-codes";
