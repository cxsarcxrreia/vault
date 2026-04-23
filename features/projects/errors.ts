export type DataState<T> =
  | { data: T; error: null; setupRequired?: false }
  | { data: T; error: string; setupRequired?: boolean };

export function emptyWithError<T>(data: T, error: unknown): DataState<T> {
  const message = error instanceof Error ? error.message : "Unable to load data.";
  const setupRequired =
    message.includes("project_templates") ||
    message.includes("schema cache") ||
    message.includes("relation") ||
    message.includes("Could not find the table");

  return {
    data,
    error: setupRequired
      ? "Hosted Supabase is reachable, but the app schema has not been applied yet."
      : message,
    setupRequired
  };
}
