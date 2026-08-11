"use client";

import { useEffect, useState } from "react";
import { get, put } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import type { Subject, User } from "@/types";
import { Button, Card, Select } from "@/components/ui";
import Loading from "@/components/Loading";

export default function AssignTeacher() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [s, setS] = useState<Subject | null>(null);
  const [t, setT] = useState<User[]>([]);
  const [tid, setTid] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
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

    return "Something went wrong. Please try again.";
  }

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        const [ss, us] = await Promise.all([
          get<Subject[]>("/admin/subjects"),
          get<User[]>("/admin/users"),
        ]);

        if (!mounted) return;

        const x = ss.find((v) => v.id === id) || null;

        if (!x) {
          setError("Subject not found.");
          setS(null);
          return;
        }

        setS(x);
        setTid(x.teacherId || "");

        setT(Array.isArray(us) ? us.filter((v) => v.role === "Teacher") : []);
      } catch (err: any) {
        console.error("Failed to load subject and teachers:", err);

        if (mounted) {
          setError(getErrorMessage(err));
          setS(null);
          setT([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (isSaving) return;

    setError("");

    if (!tid) {
      setError("Please select a teacher.");
      return;
    }

    try {
      setIsSaving(true);

      await put("/admin/subjects/" + id + "/teacher", {
        teacherId: tid,
      });

      setIsNavigating(true);

      r.push("/admin/subjects");
    } catch (err: any) {
      console.error("Failed to assign teacher:", err);

      setError(getErrorMessage(err));
      setIsSaving(false);
      setIsNavigating(false);
    }
  }

  if (isLoading) {
    return <Loading fullScreen text="Loading subject and teachers..." />;
  }

  if (!s) {
    return (
      <>
        {error && (
          <div className="fixed right-4 top-4 z-[110] w-[calc(100%-2rem)] max-w-md rounded-xl border border-red-200 bg-white p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                !
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-red-700">
                  Something went wrong
                </p>

                <p className="mt-1 break-words text-sm text-gray-600">
                  {error}
                </p>
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

        <Card>
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">
              Unable to load this subject.
            </p>

            <Button
              type="button"
              className="mt-4"
              onClick={() => r.push("/admin/subjects")}
            >
              Back to Subjects
            </Button>
          </div>
        </Card>
      </>
    );
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
              <p className="font-semibold text-red-700">Something went wrong</p>

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

      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading subjects..." />
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Assign Teacher</h2>

        <form className="max-w-xl space-y-3" onSubmit={save}>
          <Select
            value={tid}
            onChange={(e) => {
              setTid(e.target.value);
              setError("");
            }}
            required
            disabled={isSaving}
          >
            <option value="">Select teacher</option>

            {t.map((x) => (
              <option key={x.id} value={x.id}>
                {x.email}
              </option>
            ))}
          </Select>

          {t.length === 0 && (
            <p className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              No teachers are available.
            </p>
          )}

          <Button type="submit" disabled={isSaving || t.length === 0}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Assigning...
              </span>
            ) : (
              "Assign"
            )}
          </Button>
        </form>
      </Card>
    </>
  );
}
