"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { get, post } from "@/lib/api";
import { Button, Card, Input, Textarea } from "@/components/ui";
import Loading from "@/components/Loading";

type Course = {
  id: string;
  name: string;
  description?: string;
};

type Subject = {
  id: string;
  name: string;
  courseId: string;
  teacherId?: string;
};

export default function Create() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maximumMarks, setMaximumMarks] = useState("100");

  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

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
        setLoading(true);
        setError("");

        const [courseData, subjectData] = await Promise.all([
          get<Course[]>("/teacher/courses"),
          get<Subject[]>("/teacher/subjects"),
        ]);

        if (!mounted) return;

        setCourses(Array.isArray(courseData) ? courseData : []);
        setSubjects(Array.isArray(subjectData) ? subjectData : []);

        if (courseData.length === 0) {
          setError(
            "No courses are available. Please ask the Admin to create a course.",
          );
        } else if (subjectData.length === 0) {
          setError(
            "You have no subjects assigned to you. Please ask the Admin to assign a subject to you.",
          );
        }
      } catch (err: any) {
        console.error("Failed to load courses and subjects:", err);

        if (mounted) {
          setError(getErrorMessage(err));
          setCourses([]);
          setSubjects([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!courseId) {
      return [];
    }

    return subjects.filter((subject) => subject.courseId === courseId);
  }, [subjects, courseId]);

  const availableCourses = useMemo(() => {
    return courses.filter((course) =>
      subjects.some((subject) => subject.courseId === course.id),
    );
  }, [courses, subjects]);

  function handleCourseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedCourseId = e.target.value;

    setCourseId(selectedCourseId);
    setSubjectId("");
    setSubmitError("");
  }

  function handleSubjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSubjectId(e.target.value);
    setSubmitError("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (saving) return;

    setSubmitError("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setSubmitError("Please enter an assignment title.");
      return;
    }

    if (!trimmedDescription) {
      setSubmitError("Please enter an assignment description.");
      return;
    }

    if (!courseId) {
      setSubmitError("Please select a course.");
      return;
    }

    if (!subjectId) {
      setSubmitError("Please select a subject.");
      return;
    }

    const selectedSubject = filteredSubjects.find(
      (subject) => subject.id === subjectId,
    );

    if (!selectedSubject) {
      setSubmitError(
        "The selected subject does not belong to the selected course.",
      );
      return;
    }

    if (!deadline) {
      setSubmitError("Please select a deadline.");
      return;
    }

    const deadlineDate = new Date(deadline);

    if (Number.isNaN(deadlineDate.getTime())) {
      setSubmitError("Invalid deadline.");
      return;
    }

    if (deadlineDate <= new Date()) {
      setSubmitError("Deadline must be in the future.");
      return;
    }

    const marks = Number(maximumMarks);

    if (!Number.isFinite(marks) || marks <= 0) {
      setSubmitError("Maximum marks must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      await post("/teacher/assignments", {
        title: trimmedTitle,
        description: trimmedDescription,
        deadline: deadlineDate.toISOString(),
        maximumMarks: marks,
        courseId: selectedSubject.courseId,
        subjectId: selectedSubject.id,
      });

      setNavigating(true);
      router.push("/teacher/assignments");
    } catch (err: any) {
      console.error("Failed to create assignment:", err);

      setSubmitError(getErrorMessage(err));
      setSaving(false);
      setNavigating(false);
    }
  }

  if (loading) {
    return <Loading fullScreen text="Loading courses and subjects..." />;
  }

  return (
    <>
      {navigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading assignments..." />
        </div>
      )}

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

      <Card>
        <h2 className="mb-6 text-lg font-semibold">Create Assignment</h2>

        <form className="w-full max-w-2xl space-y-5" onSubmit={save}>
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>

            <Input
              placeholder="Assignment title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSubmitError("");
              }}
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <Textarea
              placeholder="Assignment description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSubmitError("");
              }}
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Course</label>

            {availableCourses.length > 0 ? (
              <select
                value={courseId}
                onChange={handleCourseChange}
                required
                disabled={saving}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Select Course</option>

                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-500">
                No courses with assigned subjects are available.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Subject</label>

            {!courseId ? (
              <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-500">
                Please select a course first.
              </p>
            ) : filteredSubjects.length === 0 ? (
              <p className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                No subjects assigned to you for this course. Please ask the
                Admin to assign a subject to you.
              </p>
            ) : (
              <select
                value={subjectId}
                onChange={handleSubjectChange}
                required
                disabled={saving}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Select Subject</option>

                {filteredSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Deadline</label>

            <Input
              type="datetime-local"
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                setSubmitError("");
              }}
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Maximum Marks
            </label>

            <Input
              type="number"
              min="1"
              value={maximumMarks}
              onChange={(e) => {
                setMaximumMarks(e.target.value);
                setSubmitError("");
              }}
              required
              disabled={saving}
            />
          </div>

          {submitError && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <Button
            type="submit"
            disabled={
              saving ||
              availableCourses.length === 0 ||
              filteredSubjects.length === 0 ||
              !courseId ||
              !subjectId
            }
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Creating...
              </span>
            ) : (
              "Create Draft"
            )}
          </Button>
        </form>
      </Card>
    </>
  );
}
