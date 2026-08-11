"use client";

import { useEffect, useState } from "react";
import { get, patch } from "@/lib/api";
import type { Assignment, Course, Subject } from "@/types";
import { Button, Card } from "@/components/ui";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import Delete from "./Delete";

export default function View() {
  const [a, setA] = useState<Assignment[]>([]);
  const [c, setC] = useState<Course[]>([]);
  const [s, setS] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loadingStatusId, setLoadingStatusId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const r = useRouter();

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [assignments, courses, subjects] = await Promise.all([
        get<Assignment[]>("/teacher/assignments"),
        get<Course[]>("/teacher/courses"),
        get<Subject[]>("/teacher/subjects"),
      ]);

      const assignmentsWithDefaultStatus = assignments.map((assignment) => ({
        ...assignment,
        status: assignment.status || "Draft",
      }));

      setA(assignmentsWithDefaultStatus);
      setC(courses);
      setS(subjects);
    } catch (err) {
      setA([]);
      setC([]);
      setS([]);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load assignments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function navigateTo(url: string) {
    try {
      setActionError("");
      setIsNavigating(true);
      r.push(url);
    } catch (err) {
      console.error("Navigation failed:", err);

      setIsNavigating(false);

      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to open the page. Please try again.",
      );
    }
  }

  function getCourseName(id: string) {
    return c.find((x) => x.id === id)?.name || id || "-";
  }

  function getSubjectName(id: string) {
    return s.find((x) => x.id === id)?.name || id || "-";
  }

  async function toggleStatus(assignment: Assignment) {
    try {
      setActionError("");
      setLoadingStatusId(assignment.id);

      const currentStatus = assignment.status || "Draft";

      const newStatus = currentStatus === "Published" ? "Draft" : "Published";

      await patch("/teacher/assignments/" + assignment.id + "/status", {
        status: newStatus,
      });

      await load();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to update assignment status. Please try again.",
      );
    } finally {
      setLoadingStatusId(null);
    }
  }

  async function handleDeleted() {
    try {
      setActionError("");
      await load();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to refresh assignments.",
      );
    }
  }

  if (loading) {
    return <Loading fullScreen text="Loading assignments..." />;
  }

  return (
    <>
      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading page..." />
        </div>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">My Assignments</h2>

          <Button
            type="button"
            onClick={() => navigateTo("/teacher/assignments/create")}
            disabled={isNavigating}
          >
            Create
          </Button>
        </div>

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>

            <Button
              type="button"
              className="bg-red-600"
              onClick={load}
              disabled={loading}
            >
              {loading ? "Loading..." : "Retry"}
            </Button>
          </div>
        )}

        {actionError && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            <span>{actionError}</span>

            <button
              type="button"
              onClick={() => setActionError("")}
              className="shrink-0 text-lg font-medium text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {!error && a.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-slate-500">No assignments found.</p>

            <Button
              type="button"
              className="mt-4"
              onClick={() => navigateTo("/teacher/assignments/create")}
              disabled={isNavigating}
            >
              Create Assignment
            </Button>
          </div>
        )}

        {!error && a.length > 0 && (
          <div className="space-y-3">
            {a.map((x) => {
              const status = x.status || "Draft";
              const isStatusLoading = loadingStatusId === x.id;

              return (
                <div key={x.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">
                        {x.title || "Untitled Assignment"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {getCourseName(x.courseId)} ·{" "}
                        {getSubjectName(x.subjectId)} ·{" "}
                        <span
                          className={
                            status === "Published"
                              ? "font-medium text-green-600"
                              : "font-medium text-yellow-600"
                          }
                        >
                          {status}
                        </span>
                      </p>

                      <p className="mt-1 text-sm">
                        Deadline:{" "}
                        {x.deadline
                          ? new Date(x.deadline).toLocaleString()
                          : "-"}{" "}
                        · Max: {x.maximumMarks ?? "-"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-start gap-2">
                      <Button
                        type="button"
                        onClick={() =>
                          navigateTo("/teacher/assignments/update/" + x.id)
                        }
                        disabled={isNavigating || isStatusLoading}
                      >
                        Update
                      </Button>

                      <Button
                        type="button"
                        onClick={() => toggleStatus(x)}
                        disabled={isNavigating || isStatusLoading}
                      >
                        {isStatusLoading
                          ? "Updating..."
                          : status === "Published"
                            ? "Draft"
                            : "Publish"}
                      </Button>

                      <Delete id={x.id} onDeleted={handleDeleted} />
                    </div>
                  </div>

                  {x.description && (
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-700">
                      {x.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
