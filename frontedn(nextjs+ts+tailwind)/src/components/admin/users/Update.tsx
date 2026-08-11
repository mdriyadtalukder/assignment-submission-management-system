"use client";

import { useEffect, useState } from "react";
import { get, put } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import type { User, Course } from "@/types";
import { Button, Card, Input, Select } from "@/components/ui";
import Loading from "@/components/Loading";

export default function Update() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [u, setU] = useState<User | null>(null);
  const [c, setC] = useState<Course[]>([]);
  const [pw, setPw] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        const [users, courses] = await Promise.all([
          get<User[]>("/admin/users"),
          get<Course[]>("/admin/courses"),
        ]);

        if (!mounted) return;

        const user = users.find((x) => x.id === id);

        if (!user) {
          setError("User not found.");
          setU(null);
          return;
        }

        setU(user);
        setC(Array.isArray(courses) ? courses : []);
      } catch (err: any) {
        console.error("Failed to load user:", err);

        if (mounted) {
          setError(getErrorMessage(err));
          setU(null);
          setC([]);
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

  if (isLoading) {
    return <Loading fullScreen text="Loading user..." />;
  }

  if (!u) {
    return (
      <>
        {error && (
          <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-md rounded-xl border border-red-200 bg-white p-4 shadow-xl">
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
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              User not found
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              The user you are trying to update could not be found.
            </p>

            <Button
              type="button"
              onClick={() => r.push("/admin/users")}
              className="mt-5"
            >
              Back to Users
            </Button>
          </div>
        </Card>
      </>
    );
  }

  function toggleCourse(courseId: string) {
    setU((prev) => {
      if (!prev) return prev;

      const exists = prev.courseIds.includes(courseId);

      return {
        ...prev,
        courseIds: exists
          ? prev.courseIds.filter((id) => id !== courseId)
          : [...prev.courseIds, courseId],
      };
    });

    setError("");
  }

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as User["role"];

    setU((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        role: newRole,
        courseIds: newRole === "Student" ? prev.courseIds : [],
      };
    });

    setError("");
  }

  async function s(e: React.FormEvent) {
    e.preventDefault();

    if (isSaving) return;

    setError("");
    setSuccess("");

    if (!u.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!u.role) {
      setError("Please select a role.");
      return;
    }

    if (u.role === "Student" && u.courseIds.length === 0) {
      setError("Please select at least one course for the student.");
      return;
    }

    if (pw.trim() && pw.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsSaving(true);

      await put("/admin/users/" + id, {
        email: u.email.trim(),
        password: pw.trim() || "",
        role: u.role,
        courseIds: u.role === "Student" ? u.courseIds : [],
      });

      setSuccess("User updated successfully.");

      setTimeout(() => {
        r.push("/admin/users");
      }, 500);
    } catch (err: any) {
      console.error("Failed to update user:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {error && (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-md rounded-xl border border-red-200 bg-white p-4 shadow-xl">
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

      {success && (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-md rounded-xl border border-green-200 bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">
              ✓
            </div>

            <div className="flex-1">
              <p className="font-semibold text-green-700">Success</p>

              <p className="mt-1 text-sm text-gray-600">{success}</p>
            </div>
          </div>
        </div>
      )}

      {isSaving && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-xl bg-white px-6 py-5 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />

              <span className="text-sm font-medium text-gray-700">
                Updating user...
              </span>
            </div>
          </div>
        </div>
      )}

      <Card>
        <h2 className="mb-5 text-lg font-semibold">Update User</h2>

        <form className="w-full max-w-3xl space-y-5" onSubmit={s}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="w-full">
              <Input
                type="email"
                placeholder="Email"
                value={u.email}
                onChange={(e) => {
                  setU({
                    ...u,
                    email: e.target.value,
                  });
                  setError("");
                }}
                required
                disabled={isSaving}
              />
            </div>

            <div className="w-full">
              <Input
                type="password"
                placeholder="New password (optional)"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError("");
                }}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="w-full sm:max-w-xs">
            <Select
              value={u.role}
              onChange={handleRoleChange}
              disabled={isSaving}
            >
              <option value="Student">Student</option>

              <option value="Teacher">Teacher</option>

              <option value="Admin">Admin</option>
            </Select>
          </div>

          {u.role === "Student" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Select Courses</label>

                <p className="mt-1 text-xs text-gray-500">
                  Select one or more courses for this student.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-3">
                {c.length === 0 ? (
                  <p className="text-sm text-gray-500">No courses available.</p>
                ) : (
                  c.map((x) => (
                    <label
                      key={x.id}
                      className={`flex min-w-0 items-center gap-3 rounded-md border p-3 transition ${
                        isSaving
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0"
                        checked={u.courseIds.includes(x.id)}
                        onChange={() => toggleCourse(x.id)}
                        disabled={isSaving}
                      />

                      <span className="truncate text-sm">{x.name}</span>
                    </label>
                  ))
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className={`text-sm ${
                    u.courseIds.length === 0
                      ? "font-medium text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {u.courseIds.length} course
                  {u.courseIds.length !== 1 ? "s" : ""} selected
                </p>

                {u.courseIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setU({
                        ...u,
                        courseIds: [],
                      })
                    }
                    disabled={isSaving}
                    className="text-sm text-red-500 hover:underline disabled:opacity-50"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {u.role !== "Student" && (
            <p className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              Course selection is only available for students. Admins and
              teachers cannot be assigned to courses here.
            </p>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>

            <Button
              type="button"
              disabled={isSaving}
              onClick={() => r.push("/admin/users")}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
