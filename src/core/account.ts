import * as t from "io-ts";
import { fromNewtype, UUID } from "io-ts-types";
import type { Newtype } from "newtype-ts";
import { iso } from "newtype-ts";

import { UserId } from "./user";

/**
 * `AccountId` is a newtype that wraps a UUID.
 *
 * In functional programming, newtypes are used to create more meaningful type
 * distinctions without runtime overhead. This prevents accidental mixing of
 * types that have the same underlying representation but different meanings.
 *
 * We use `newtype-ts` to define the `AccountId`, which ensures it is
 * treated as a distinct type. The `iso` utility from `newtype-ts` allows
 * safe conversion between the newtype and its underlying representation
 * (in this case, a `UUID`).
 *
 * @type AccountId - Represents a newtype wrapping a UUID.
 */
export type AccountId = Newtype<{ readonly AccountId: unique symbol }, UUID>;

/**
 * `AccountId` codec using `io-ts`.
 *
 * `io-ts` is a runtime type validation library that allows us to define
 * type-safe data structures. Here, we use `fromNewtype` to create a codec
 * for the `AccountId`, which will ensure that any data passed as an `AccountId`
 * adheres to the UUID format.
 */
export const AccountId = fromNewtype<AccountId>(UUID);

/**
 * `isoAccountId` provides isomorphism between the `AccountId` newtype and its
 * underlying `UUID` value.
 *
 * This isomorphism allows you to easily "unwrap" the newtype to its base type
 * (UUID) or "wrap" a UUID into the `AccountId` type, ensuring safe and explicit
 * type conversions.
 */
export const isoAccountId = iso<AccountId>();

/**
 * `Account` is a core domain model that represents an account, defined using `io-ts`.
 *
 * The `Account` type consists of two fields:
 * - `accountId`: A unique identifier for the account, wrapped as a `AccountId`
 *   newtype.
 * - `ownerId`: The `UserId` of the owner of this account.
 *
 * The use of `io-ts` allows us to ensure that the `Account` type is validated
 * at runtime, providing strong type guarantees and preventing invalid data from
 * propagating through the system.
 */
export const Account = t.type({
  accountId: AccountId,
  ownerId: UserId,
});

/**
 * Represents the TypeScript type derived from the `Account` codec.
 *
 * The `t.TypeOf<typeof Account>` type automatically infers the correct
 * TypeScript representation of the validated `Account` type from the `io-ts`
 * codec.
 *
 * This ensures that wherever the `Account` type is used in the system, it
 * adheres to the stable, validated structure defined in the core domain model.
 */
export type Account = t.TypeOf<typeof Account>;
