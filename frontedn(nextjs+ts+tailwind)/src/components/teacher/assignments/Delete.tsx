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
  const [showPopup, setShowPopup] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    try {
      setDeleting(true);
      setError("");

      await del("/teacher/assignments/" + id);

      setShowPopup(false);
      onDeleted();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete assignment. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        className="bg-red-600"
        onClick={() => {
          setError("");
          setShowPopup(true);
        }}
        disabled={deleting}
      >
        Delete
      </Button>

      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!deleting) {
              setShowPopup(false);
              setError("");
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Delete Assignment
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </p>

            {error && (
              <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                className="bg-black text-white hover:bg-slate-700"
                onClick={() => {
                  setShowPopup(false);
                  setError("");
                }}
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className="bg-red-600"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
