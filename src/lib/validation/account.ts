/** Kata yang harus diketik responden untuk menghapus akunnya. */
export const DELETE_CONFIRM_WORD = "HAPUS";

export function isDeleteConfirmed(input: string) {
  return input.trim().toUpperCase() === DELETE_CONFIRM_WORD;
}
