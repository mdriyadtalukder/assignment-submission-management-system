"use client";

import { useEffect, useState } from "react";
import { post, get } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Course } from "@/types";
import { Button, Card, Input, Select } from "@/components/ui";

export default function Create() {
  const r = useRouter();

  const [c, setC] = useState<Course[]>([]);
  const [email, setE] = useState("");
  const [password, setP] = useState("");
  const [role, setR] = useState("Student");
  const [courseIds, setCourseIds] = useState<string[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      try {
        setLoadingCourses(true);
        setError("");

        const courses = await get<Course[]>("/admin/courses");

        if (mounted) {
          setC(Array.isArray(courses) ? courses : []);
        }
      } catch (err: any) {
        console.error("Failed to load courses:", err);

        if (mounted) {
          setC([]);
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load courses. Please try again.",
          );
        }
      } finally {
        if (mounted) {
          setLoadingCourses(false);
        }
      }
    }

    loadCourses();

    return () => {
      mounted = false;
    };
  }, []);

  function toggleCourse(courseId: string) {
    setCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  }

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;

    setR(newRole);
    setError("");

    if (newRole !== "Student") {
      setCourseIds([]);
    }
  }

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

  async function s(e: React.FormEvent) {
    e.preventDefault();

    if (isCreating) return;

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!role) {
      setError("Please select a role.");
      return;
    }

    if (role === "Student" && courseIds.length === 0) {
      setError("Please select at least one course for the student.");
      return;
    }

    try {
      setIsCreating(true);

      await post("/admin/users", {
        email: email.trim(),
        password,
        role,
        courseIds: role === "Student" ? courseIds : [],
      });

      setSuccess("User created successfully.");

      setTimeout(() => {
        r.push("/admin/users");
      }, 500);
    } catch (err: any) {
      console.error("Failed to create user:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsCreating(false);
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

      {isCreating && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-xl bg-white px-6 py-5 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />

              <span className="text-sm font-medium text-gray-700">
                Creating user...
              </span>
            </div>
          </div>
        </div>
      )}

      <Card>
        <h2 className="mb-5 text-lg font-semibold">Create User</h2>

        <form className="w-full max-w-3xl space-y-5" onSubmit={s}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setE(e.target.value);
                  setError("");
                }}
                required
                disabled={isCreating}
              />
            </div>

            <div className="w-full">
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setP(e.target.value);
                  setError("");
                }}
                required
                disabled={isCreating}
              />
            </div>
          </div>

          <div className="w-full sm:max-w-xs">
            <Select
              value={role}
              onChange={handleRoleChange}
              disabled={isCreating}
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </Select>
          </div>

          {role === "Student" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Select Courses</label>

                <p className="mt-1 text-xs text-gray-500">
                  Select at least one course for this student.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-3">
                {loadingCourses ? (
                  <div className="col-span-full flex items-center justify-center py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
                      Loading courses...
                    </div>
                  </div>
                ) : c.length === 0 ? (
                  <p className="col-span-full py-4 text-sm text-gray-500">
                    No courses available.
                  </p>
                ) : (
                  c.map((x) => (
                    <label
                      key={x.id}
                      className={`flex min-w-0 items-center gap-3 rounded-md border p-3 transition ${
                        isCreating
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0"
                        checked={courseIds.includes(x.id)}
                        onChange={() => {
                          toggleCourse(x.id);
                          setError("");
                        }}
                        disabled={isCreating}
                      />

                      <span className="truncate text-sm">{x.name}</span>
                    </label>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between">
                <p
                  className={`text-sm ${
                    courseIds.length === 0
                      ? "font-medium text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {courseIds.length} course
                  {courseIds.length !== 1 ? "s" : ""} selected
                </p>

                {courseIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCourseIds([]);
                      setError("");
                    }}
                    disabled={isCreating}
                    className="text-sm text-red-500 hover:underline disabled:opacity-50"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {role !== "Student" && (
            <p className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              Course selection is only available for students. Admins and
              teachers cannot be assigned to courses here.
            </p>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button type="submit" disabled={isCreating || loadingCourses}>
              {isCreating ? "Creating..." : "Create User"}
            </Button>

            <Button
              type="button"
              disabled={isCreating}
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
