"use client";

import type { ComponentProps } from "react";

/** Tombol submit yang meminta konfirmasi dulu (untuk aksi yang menghapus data). */
export function ConfirmSubmit({ message, ...props }: ComponentProps<"button"> & { message: string }) {
  return (
    <button
      type="submit"
      {...props}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    />
  );
}
