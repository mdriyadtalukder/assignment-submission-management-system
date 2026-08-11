"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import type { User, Course } from "@/types";
import { Button, Card } from "@/components/ui";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import Delete from "@/components/admin/users/Delete";

export default function View() {
  const [a, setA] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const r = useRouter();
  const pathname = usePathname();

  const load = () => {
    get<User[]>("/admin/users")
      .then((users) => {
        setA(Array.isArray(users) ? users : []);
      })
      .catch((error) => {
        console.error("Failed to load users:", error);
      });

    get<Course[]>("/admin/courses")
      .then((courses) => {
        setCourses(Array.isArray(courses) ? courses : []);
      })
      .catch((error) => {
        console.error("Failed to load courses:", error);
      });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const navigateTo = (url: string) => {
    setIsNavigating(true);
    r.push(url);
  };

  function getCourseName(courseId: string) {
    return courses.find((course) => course.id === courseId)?.name || courseId;
  }

  function renderCourses(user: User) {
    if (user.role !== "Student" || user.courseIds.length === 0) {
      return "-";
    }

    const firstThree = user.courseIds.slice(0, 3);
    const remaining = user.courseIds.length - 3;

    return (
      <div className="flex max-w-xs flex-wrap items-center gap-1">
        {firstThree.map((courseId) => (
          <span
            key={courseId}
            className="rounded-md bg-gray-100 px-2 py-1 text-xs"
          >
            {getCourseName(courseId)}
          </span>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => setSelectedUser(user)}
            className="whitespace-nowrap text-xs font-medium text-blue-600 hover:underline"
          >
            +{remaining} See more
          </button>
        )}
      </div>
    );
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
          <h2 className="text-lg font-semibold">Users</h2>

          <Button
            onClick={() => navigateTo("/admin/users/create")}
            disabled={isNavigating}
          >
            Create
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Courses</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {a.map((x) => (
                <tr key={x.id} className="border-b">
                  <td className="p-2">{x.email}</td>

                  <td className="p-2">{x.role}</td>

                  <td className="p-2">{renderCourses(x)}</td>

                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() =>
                          navigateTo("/admin/users/update/" + x.id)
                        }
                        disabled={isNavigating}
                      >
                        Update
                      </Button>

                      <Delete id={x.id} onDeleted={load} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h3 className="text-lg font-semibold">Student Courses</h3>

                <p className="mt-1 break-all text-sm text-gray-500">
                  {selectedUser.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {selectedUser.courseIds.map((courseId, index) => (
                  <div
                    key={courseId}
                    className="flex min-w-0 items-center gap-3 rounded-lg border p-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                      {index + 1}
                    </span>

                    <span className="min-w-0 truncate text-sm">
                      {getCourseName(courseId)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t p-4">
              <span className="text-sm text-gray-500">
                {selectedUser.courseIds.length} course
                {selectedUser.courseIds.length !== 1 ? "s" : ""}
              </span>

              <Button onClick={() => setSelectedUser(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
