import * as t from "io-ts";
import { fromNewtype, UUID } from "io-ts-types";
import type { Newtype } from "newtype-ts";
import { iso } from "newtype-ts";

import { Email } from "./email";

/**
 * `UserId` is a newtype representing a user's unique identifier, which wraps a
 * UUID.
 *
 * By using a newtype for `UserId`, we ensure that it is distinct from other
 * UUIDs in the system, like `AccountId`. This prevents accidental type mixing
 * and reinforces domain-specific meaning.
 *
 * @type UserId - Represents a newtype wrapping a UUID.
 */
export type UserId = Newtype<{ readonly UserId: unique symbol }, UUID>;

/**
 * `UserId` codec using `io-ts`.
 *
 * This codec validates that the `UserId` is properly formatted as a UUID.
 * The use of `fromNewtype` ensures that the `UserId` maintains its strong type
 * distinction at runtime while also being validated as a UUID.
 */
export const UserId = fromNewtype<UserId>(UUID);

/**
 * `isoUserId` provides an isomorphism between the `UserId` newtype and its
 * underlying UUID value.
 *
 * This allows safe conversion between `UserId` and `UUID`, making it easy to
 * convert back and forth between the newtype and its base representation
 * when needed.
 */
export const isoUserId = iso<UserId>();

/**
 * `User` is a core domain model representing a user.
 *
 * The `User` type includes:
 * - `firstName`: The user's first name.
 * - `lastName`: The user's last name.
 * - `id`: The user's unique identifier, represented as a `UserId` newtype.
 * - `email`: The user's email address, represented as the `Email` newtype.
 *
 * The `User` type is defined using `io-ts`, allowing us to validate its
 * structure at runtime, ensuring that all users in the system conform to the
 * expected schema.
 */
export const User = t.type({
  firstName: t.string,
  lastName: t.string,
  id: UserId,
  email: Email,
});

/**
 * Represents the TypeScript type inferred from the `User` codec.
 *
 * This type ensures that wherever the `User` model is used, it adheres to the
 * stable structure defined by the `io-ts` codec. This keeps the domain model
 * consistent across the system.
 */
export type User = t.TypeOf<typeof User>;
