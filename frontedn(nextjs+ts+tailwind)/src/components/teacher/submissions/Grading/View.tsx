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

  function handleCancel() {
    try {
      setNavigating(true);
      router.push("/teacher/submissions");
    } catch (err) {
      console.error("Navigation failed:", err);

      setNavigating(false);
      setError("Failed to navigate. Please try again.");
    }
  }

  async function save() {
    if (!submission) {
      setError("Submission not found.");
      return;
    }

    setValidationError("");
    setError("");

    const numericMarks = Number(marks);

    if (marks.trim() === "") {
      setValidationError("Please enter marks.");
      return;
    }

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
      console.error("Failed to grade submission:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to grade submission. Please try again.",
      );

      setNavigating(false);
    } finally {
      setSaving(false);
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

          <div className="mt-4">
            <Button type="button" onClick={handleCancel} disabled={navigating}>
              {navigating ? "Loading..." : "Back to Submissions"}
            </Button>
          </div>
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
        <h2 className="mb-6 text-lg font-semibold">Grade Submission</h2>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 space-y-3 rounded-lg bg-slate-50 p-4">
          <p className="text-sm">
            <strong>Assignment:</strong> {submission.assignmentId}
          </p>

          <p className="text-sm">
            <strong>Student:</strong> {submission.studentId}
          </p>

          <div>
            <p className="mb-2 text-sm font-medium">Student Answer</p>

            <div className="rounded-md border bg-white p-4">
              <p className="whitespace-pre-wrap text-sm">
                {submission.content}
              </p>
            </div>
          </div>
        </div>

        {validationError && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {validationError}
          </div>
        )}

        <div className="max-w-xl space-y-4">
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
              placeholder="Enter marks"
              required
              disabled={saving}
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
              disabled={saving}
            >
              <option value="Graded">Graded</option>
              <option value="Rejected">Rejected</option>
              <option value="Late">Late</option>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Feedback</label>

            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write feedback for the student"
              disabled={saving}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={save}
              disabled={saving || navigating}
            >
              {saving ? "Saving..." : "Save Grade"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={saving || navigating}
            >
              {navigating ? "Loading..." : "Cancel"}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
