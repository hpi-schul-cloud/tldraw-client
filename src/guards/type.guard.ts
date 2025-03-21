export class TypeGuard {
  public static checkKeyAndValueExists(
    json: Record<string, unknown>,
    key: string,
  ): void {
    if (!(key in json) && json[key]) {
      throw new Error(`The ${key} is missing`);
    }
  }

  public static ensureKeyAndValueExists(
    json: Record<string, unknown>,
    key: string,
  ): unknown {
    if (!(key in json) || !json[key]) {
      throw new Error(`The ${key} is missing`);
    }

    return json[key];
  }

  public static checkNumber(value: unknown): void {
    if (typeof value !== "number") {
      throw new Error("Type is not a number");
    }
  }

  public static checkArray(value: unknown): void {
    if (!Array.isArray(value)) {
      throw new Error("Type is not an array");
    }
  }

  public static checkBoolean(value: unknown): void {
    if (typeof value !== "boolean") {
      throw new Error("Type is not a boolean");
    }
  }

  public static ensureString(value: unknown): string {
    if (typeof value !== "string") {
      throw new Error("Type is not a string");
    }

    return value;
  }

  public static isNull(value: unknown): value is null {
    const isNull = value === null;

    return isNull;
  }

  public static isArray(value: unknown): value is [] {
    const isArray = Array.isArray(value);

    return isArray;
  }

  public static isRecord(value: unknown): value is Record<string, unknown> {
    const isObject =
      typeof value === "object" &&
      !TypeGuard.isArray(value) &&
      !TypeGuard.isNull(value);

    return isObject;
  }

  public static ensureRecord(value: unknown): Record<string, unknown> {
    if (!TypeGuard.isRecord(value)) {
      throw new Error("Type is not an object.");
    }

    return value;
  }
}
