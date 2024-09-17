import * as t from "io-ts";
import { fromNewtype } from "io-ts-types";
import type { Newtype } from "newtype-ts";
import { iso } from "newtype-ts";

/**
 * `Email` is a newtype that wraps a `string` to represent an email address.
 *
 * By using a newtype, we distinguish email addresses from other plain `string`
 * values, ensuring stronger type safety. This approach prevents accidental
 * mixing of `Email` with other `string` types (e.g., usernames or other
 * identifiers) and makes the type more expressive in the domain model.
 *
 * @type Email - Represents a distinct type for email addresses.
 */
export type Email = Newtype<{ readonly Email: unique symbol }, string>;

/**
 * `Email` codec using `io-ts`.
 *
 * `io-ts` allows us to define runtime type validation for our domain models.
 * This codec ensures that any data that claims to be an `Email` is validated
 * as a `string`, while still preserving the stronger type safety provided by
 * the newtype.
 */
export const Email = fromNewtype<Email>(t.string);

/**
 * `isoEmail` provides isomorphism between the `Email` newtype and the
 * underlying `string` value.
 *
 * The isomorphism allows safe conversion between the `Email` newtype and a raw
 * string. This ensures that type conversion is explicit and controlled,
 * maintaining the integrity of the `Email` type across the system.
 */
export const isoEmail = iso<Email>();
