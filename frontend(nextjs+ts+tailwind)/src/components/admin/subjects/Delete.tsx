"use client";

import { useState } from "react";
import { del } from "@/lib/api";
import { Button } from "@/components/ui";

export default function Delete({
  id,
  onDeleted,
}: {
  id: string;
  onDeleted: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  function getErrorMessage(err: any) {
    if (err?.response?.data?.message) {
      const message = err.response.data.message;

      if (Array.isArray(message)) {
        return message.join(", ");
      }

      return String(message);
    }

    if (err?.message) {
      return String(err.message);
    }

    return "Failed to delete subject. Please try again.";
  }

  async function handleDelete() {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      setError("");

      await del("/admin/subjects/" + id);

      setShowModal(false);
      onDeleted();
    } catch (err: any) {
      console.error("Failed to delete subject:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancel() {
    if (isDeleting) return;

    setShowModal(false);
    setError("");
  }

  return (
    <>
      {error && (
        <div className="fixed right-4 top-4 z-[110] w-[calc(100%-2rem)] max-w-md rounded-xl border border-red-200 bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
              !
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-red-700">Delete failed</p>

              <p className="mt-1 break-words text-sm text-gray-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-xl leading-none text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Button
        type="button"
        className="bg-red-600 hover:bg-red-700"
        onClick={() => setShowModal(true)}
        disabled={isDeleting}
      >
        Delete
      </Button>

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
              !
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Delete Subject?
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete this subject? This action cannot
              be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isDeleting}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-white" />
                    Deleting...
                  </span>
                ) : (
                  "Delete Subject"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
