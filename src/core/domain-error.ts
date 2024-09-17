import util from "util";

export abstract class DomainError extends Error {
  public readonly message: string;

  constructor(data: unknown) {
    super();

    this.message = this.safeStringify(data);
  }

  private safeStringify(data: unknown): string {
    if (data && typeof data === "object") {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const nativeStringified = data.toString();
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      if (nativeStringified !== Object.prototype.toString()) {
        return nativeStringified;
      }
    }

    try {
      return JSON.stringify(data, null, 2); // Pretty-print with indentation
    } catch {
      return util.inspect(data, { depth: null, colors: false });
    }
  }
}
