/** Status form yang dikembalikan Server Action ke useActionState. */
export type FormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  values?: Record<string, string>;
  ok?: boolean;
};

export const initialFormState: FormState = {};

export function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Hanya izinkan path internal untuk redirect setelah login. */
export function safeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/admin")) return null;
  return next;
}
