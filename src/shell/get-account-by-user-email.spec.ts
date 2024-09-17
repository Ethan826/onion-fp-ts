import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import type { UUID } from "io-ts-types";

import { isoAccountId } from "../core/account";
import { isoEmail } from "../core/email";
import { isoUserId } from "../core/user";
import { createAccountService } from "../services/account-service";
import type { UserService } from "../services/user-service";
import { createUserService } from "../services/user-service";
import { getAccountByUserEmail } from "./get-account-by-user-email";

describe("getAccountByUserEmail", () => {
  it("returns the expected result", async () => {
    const result = await getAccountByUserEmail(isoEmail.wrap("input"))(
      getTestMocks().mockDeps
    )();

    expect(result).toEqual(
      E.of(
        O.of({
          accountId: "testAccountId",
          ownerId: "testUserId2",
        })
      )
    );
  });

  it("calls colllaborators with the expected arguments", async () => {
    const { mockDeps, getUserByEmailSpy, getAccountByOwnerIdSpy } =
      getTestMocks();

    await getAccountByUserEmail(isoEmail.wrap("input"))(mockDeps)();

    expect(getUserByEmailSpy).toHaveBeenCalledWith("input");
    expect(getAccountByOwnerIdSpy).toHaveBeenCalledWith("testUserId1");
  });
});

const getTestMocks = () => {
  const getUserByEmailSpy = jest.fn().mockReturnValue(
    TE.of(
      O.of({
        firstName: "testFirstName",
        lastName: "testLastName",
        id: isoUserId.wrap("testUserId1" as UUID),
        email: isoEmail.wrap("testEmail"),
      })
    )
  );

  const mockUserProvider: UserService = createUserService({
    getUserByEmail: getUserByEmailSpy,
  });

  const getAccountByOwnerIdSpy = jest.fn().mockReturnValue(
    TE.of(
      O.some({
        accountId: isoAccountId.wrap("testAccountId" as UUID),
        ownerId: isoUserId.wrap("testUserId2" as UUID),
      })
    )
  );

  const mockAccountProvider = createAccountService({
    getAccountByOwnerId: getAccountByOwnerIdSpy,
  });

  return {
    mockDeps: { ...mockAccountProvider, ...mockUserProvider },
    getUserByEmailSpy,
    getAccountByOwnerIdSpy,
  };
};
