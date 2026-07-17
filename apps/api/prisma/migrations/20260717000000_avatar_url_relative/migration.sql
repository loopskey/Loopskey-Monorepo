-- Self-hosted avatar URLs were built at upload time from the serving process's
-- APP_HOST/APP_PORT and stored absolute, so rows written while the API was bound
-- to 0.0.0.0 point at an origin no browser can load, and every stored URL breaks
-- for good whenever the host or port changes. The URL is now stored root-relative
-- and resolved by the client against its own configured API origin.
--
-- Rebuild it from "avatarStorageKey", which is the real identifier of the file.
-- External avatars (OAuth, seeds) have no storage key and are left untouched.
UPDATE "User"
SET "avatarUrl" = '/professional/profile/avatar/' || "avatarStorageKey"
WHERE "avatarStorageKey" IS NOT NULL;
