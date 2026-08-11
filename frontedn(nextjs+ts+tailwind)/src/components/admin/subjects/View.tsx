"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import type { Subject, Course, User } from "@/types";
import { Button, Card } from "@/components/ui";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import Delete from "@/components/admin/subjects/Delete";

export default function View() {
  const [a, setA] = useState<Subject[]>([]);
  const [c, setC] = useState<Course[]>([]);
  const [u, setU] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState("");

  const r = useRouter();
  const pathname = usePathname();

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

  const load = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [x, cs, us] = await Promise.all([
        get<Subject[]>("/admin/subjects"),
        get<Course[]>("/admin/courses"),
        get<User[]>("/admin/users"),
      ]);

      setA(Array.isArray(x) ? x : []);
      setC(Array.isArray(cs) ? cs : []);
      setU(Array.isArray(us) ? us : []);
    } catch (err: any) {
      console.error("Failed to load subjects:", err);

      setError(getErrorMessage(err));
      setA([]);
      setC([]);
      setU([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const navigateTo = (url: string) => {
    if (isNavigating) return;

    setIsNavigating(true);
    r.push(url);
  };

  const cn = (id?: string | null) => c.find((x) => x.id === id)?.name || "-";

  const tn = (id?: string | null) => u.find((x) => x.id === id)?.email || "-";

  if (isLoading) {
    return <Loading fullScreen text="Loading subjects..." />;
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
          <Loading text="Loading page..." />
        </div>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Subjects</h2>

          <Button
            onClick={() => navigateTo("/admin/subjects/create")}
            disabled={isNavigating}
          >
            Create
          </Button>
        </div>

        {a.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-slate-500">No subjects found.</p>

            <Button
              type="button"
              onClick={load}
              className="mt-4"
              disabled={isLoading}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Name</th>
                  <th className="p-2">Course</th>
                  <th className="p-2">Teacher</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {a.map((x) => (
                  <tr key={x.id} className="border-b">
                    <td className="p-2">{x.name}</td>

                    <td className="p-2">{cn(x.courseId)}</td>

                    <td className="p-2">{tn(x.teacherId)}</td>

                    <td className="p-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() =>
                            navigateTo("/admin/subjects/update/" + x.id)
                          }
                          disabled={isNavigating}
                        >
                          Update
                        </Button>

                        <Button
                          onClick={() =>
                            navigateTo("/admin/subjects/assign-teacher/" + x.id)
                          }
                          disabled={isNavigating}
                        >
                          Assign Teacher
                        </Button>

                        <Delete id={x.id} onDeleted={load} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
