export function firstReturned<T>(result: T[] | { rows?: unknown[] }) {
  if (Array.isArray(result)) {
    const [first] = result;

    if (!first) {
      throw new Error("Database write did not return a row.");
    }

    return first;
  }

  const [first] = result.rows ?? [];

  if (!first) {
    throw new Error("Database write did not return a row.");
  }

  return first as T;
}
