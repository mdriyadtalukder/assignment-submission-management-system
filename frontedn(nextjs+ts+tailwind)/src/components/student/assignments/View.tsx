"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import type { Assignment } from "@/types";
import { Button, Card } from "@/components/ui";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function View() {
  const [a, setA] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const r = useRouter();

  async function load() {
    try {
      setLoading(true);
      setError("");

      const data = await get<Assignment[]>("/student/assignments");

      setA(data);
    } catch (err) {
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

  function navigateTo(id: string) {
    try {
      setIsNavigating(true);
      setNavigatingId(id);

      r.push("/student/assignments/" + id);
    } catch (err) {
      console.error("Navigation failed:", err);

      setIsNavigating(false);
      setNavigatingId(null);
      setError("Failed to open assignment. Please try again.");
    }
  }

  if (loading) {
    return <Loading fullScreen text="Loading assignments..." />;
  }

  return (
    <>
      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading assignment..." />
        </div>
      )}

      <div className="space-y-4">
        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>

            <Button
              type="button"
              className="bg-red-600"
              onClick={load}
              disabled={loading}
            >
              {loading ? "Retrying..." : "Retry"}
            </Button>
          </div>
        )}

        {!error && a.length === 0 && (
          <Card>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-slate-500">
                There is no assignment for you.
              </p>
            </div>
          </Card>
        )}

        {!error && a.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {a.map((x) => {
              const isThisNavigating = navigatingId === x.id;

              return (
                <Card key={x.id}>
                  <div className="flex justify-between gap-3">
                    <h3 className="font-semibold">{x.title}</h3>

                    <span
                      className={`text-xs ${
                        x.status === "Published"
                          ? "text-emerald-700"
                          : "text-slate-500"
                      }`}
                    >
                      {x.status || "Draft"}
                    </span>
                  </div>

                  <p className="my-2 whitespace-pre-wrap text-sm">
                    {x.description}
                  </p>

                  <p className="text-sm">
                    Deadline: <b>{new Date(x.deadline).toLocaleString()}</b>
                  </p>

                  <p className="text-sm">
                    Maximum marks: <b>{x.maximumMarks}</b>
                  </p>

                  <Button
                    className="mt-4"
                    disabled={isNavigating}
                    onClick={() => navigateTo(x.id)}
                  >
                    {isThisNavigating ? "Loading..." : "View / Submit"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
