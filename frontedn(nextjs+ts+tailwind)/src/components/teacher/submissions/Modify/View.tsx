"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { get, put } from "@/lib/api";
import type { Submission } from "@/types";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import Loading from "@/components/Loading";

export default function View() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);

  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("Graded");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const submissions = await get<Submission[]>("/teacher/submissions");

        const found = submissions.find((x) => x.id === id);

        if (!found) {
          setError("Submission not found.");
          return;
        }

        setSubmission(found);

        setMarks(
          found.marks !== null && found.marks !== undefined
            ? String(found.marks)
            : "",
        );

        setFeedback(found.feedback || "");

        setStatus(found.status || "Graded");
      } catch (err) {
        console.error("Failed to load submission:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load submission. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    } else {
      setLoading(false);
      setError("Invalid submission ID.");
    }
  }, [id]);

  async function updateGrade(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setValidationError("");

    if (!submission) {
      setError("Submission not found.");
      return;
    }

    if (marks.trim() === "") {
      setValidationError("Marks are required.");
      return;
    }

    const numericMarks = Number(marks);

    if (Number.isNaN(numericMarks)) {
      setValidationError("Marks must be a valid number.");
      return;
    }

    if (numericMarks < 0) {
      setValidationError("Marks cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      await put(`/teacher/submissions/${id}`, {
        marks: numericMarks,
        feedback: feedback.trim() || null,
        status,
      });

      setNavigating(true);

      router.push("/teacher/submissions");
    } catch (err) {
      console.error("Failed to modify submission:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to modify submission. Please try again.",
      );

      setNavigating(false);
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    try {
      setNavigating(true);
      router.push("/teacher/submissions");
    } catch (err) {
      console.error("Navigation failed:", err);

      setNavigating(false);
      setError("Failed to navigate. Please try again.");
    }
  }

  if (loading) {
    return <Loading fullScreen text="Loading submission..." />;
  }

  if (!submission) {
    return (
      <Card>
        <div className="rounded-md border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error || "Submission not found."}
          </p>

          <Button
            type="button"
            className="mt-4"
            onClick={handleBack}
            disabled={navigating}
          >
            {navigating ? "Loading..." : "Back"}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      {navigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading page..." />
        </div>
      )}

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Modify Grade</h2>

          <p className="mt-1 text-sm text-slate-500">
            Update the marks, feedback, or submission status.
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-slate-50 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Assignment</p>

              <p className="text-sm font-medium">{submission.assignmentId}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Student</p>

              <p className="text-sm font-medium">{submission.studentId}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Current Status</p>

              <p className="text-sm font-medium">{submission.status}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Current Marks</p>

              <p className="text-sm font-medium">
                {submission.marks ?? "Not graded"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">Student Answer</p>

          <div className="rounded-lg border bg-white p-4">
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {submission.content}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {validationError && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {validationError}
          </div>
        )}

        <form onSubmit={updateGrade} className="max-w-xl space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Marks</label>

            <Input
              type="number"
              min="0"
              value={marks}
              onChange={(e) => {
                setMarks(e.target.value);
                setValidationError("");
              }}
              required
              disabled={saving || navigating}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>

            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setValidationError("");
              }}
              disabled={saving || navigating}
            >
              <option value="Submitted">Submitted</option>

              <option value="Graded">Graded</option>

              <option value="Late">Late</option>

              <option value="Rejected">Rejected</option>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Feedback</label>

            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Teacher feedback"
              disabled={saving || navigating}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving || navigating}>
              {saving ? "Updating..." : "Update Grade"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={saving || navigating}
            >
              {navigating ? "Loading..." : "Cancel"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
