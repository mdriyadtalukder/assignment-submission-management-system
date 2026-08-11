"use client";

import { useEffect, useState } from "react";
import { get, post, put } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import type { Assignment, Submission } from "@/types";
import { Button, Card, Textarea } from "@/components/ui";
import Loading from "@/components/Loading";

export default function Details() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [a, setA] = useState<Assignment | null>(null);
  const [s, setS] = useState<Submission | null>(null);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [assignments, submissions] = await Promise.all([
        get<Assignment[]>("/student/assignments"),
        get<Submission[]>("/student/submissions"),
      ]);

      if (!Array.isArray(assignments)) {
        setError("Invalid assignment data received from the server.");
        setA(null);
        return;
      }

      if (!Array.isArray(submissions)) {
        setError("Invalid submission data received from the server.");
        setA(null);
        return;
      }

      const assignment = assignments.find((x) => x.id === id) || null;

      if (!assignment) {
        setError("Assignment not found.");
        setA(null);
        return;
      }

      const submission = submissions.find((x) => x.assignmentId === id) || null;

      setA(assignment);
      setS(submission);
      setContent(submission?.content || "");
    } catch (err) {
      setA(null);
      setS(null);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load assignment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!a) {
      setActionError("Assignment not found.");
      return;
    }

    setActionError("");

    if (!content.trim()) {
      setActionError("Please enter your answer before submitting.");
      return;
    }

    const deadline = new Date(a.deadline);

    if (Number.isNaN(deadline.getTime())) {
      setActionError("Invalid assignment deadline.");
      return;
    }

    if (deadline <= new Date()) {
      setActionError(
        "The deadline has passed. Your submission cannot be changed.",
      );
      return;
    }

    try {
      setSaving(true);

      if (s) {
        await put("/student/submissions/" + s.id, {
          content: content.trim(),
        });
      } else {
        await post("/student/assignments/" + id + "/submissions", {
          content: content.trim(),
        });
      }

      r.push("/student/submissions");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : s
            ? "Failed to update submission. Please try again."
            : "Failed to submit answer. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loading fullScreen text="Loading assignment..." />;
  }

  if (!a) {
    return (
      <Card>
        <div className="space-y-4">
          <p className="text-sm text-red-600">
            {error || "Assignment not found."}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Retry"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => r.push("/student/assignments")}
            >
              Back
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const deadline = new Date(a.deadline);
  const expired = Number.isNaN(deadline.getTime()) || deadline <= new Date();

  return (
    <Card>
      <h2 className="text-xl font-semibold">{a.title || "Assignment"}</h2>

      <p className="my-3 whitespace-pre-wrap break-words">
        {a.description || "No description provided."}
      </p>

      <p className="text-sm">
        Deadline:{" "}
        <b>
          {Number.isNaN(deadline.getTime())
            ? "Invalid deadline"
            : deadline.toLocaleString()}
        </b>{" "}
        · Max: <b>{a.maximumMarks ?? "-"}</b>
      </p>

      {s && (
        <div className="my-4 rounded-lg bg-slate-50 p-4">
          <p className="text-sm">
            Status: <b>{s.status || "Submitted"}</b>
          </p>

          <p className="mt-1 text-sm">
            Marks: <b>{s.marks ?? "Not graded"}</b>
          </p>

          <p className="mt-1 whitespace-pre-wrap text-sm">
            Feedback: {s.feedback || "None"}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {actionError && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{actionError}</span>

          <button
            type="button"
            onClick={() => setActionError("")}
            className="shrink-0 text-lg font-medium"
          >
            ×
          </button>
        </div>
      )}

      {!expired && (
        <form onSubmit={save} className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Your Answer
            </label>

            <Textarea
              rows={10}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setActionError("");
              }}
              placeholder="Write your answer..."
              required
              disabled={saving}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving
                ? s
                  ? "Updating..."
                  : "Submitting..."
                : s
                  ? "Update Submission"
                  : "Submit Answer"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => r.push("/student/assignments")}
              disabled={saving}
            >
              Back
            </Button>
          </div>
        </form>
      )}

      {expired && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">
            Deadline passed. Submission cannot be changed.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => r.push("/student/assignments")}
          >
            Back
          </Button>
        </div>
      )}
    </Card>
  );
}
