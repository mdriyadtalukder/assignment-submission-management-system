"use client";
import React from "react";
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={
      "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm " +
      (p.className || "")
    }
  />
);
export const Textarea = (
  p: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) => (
  <textarea
    {...p}
    className={
      "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm " +
      (p.className || "")
    }
  />
);
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...p}
    className={
      "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm " +
      (p.className || "")
    }
  />
);
export const Button = (p: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...p}
    className={
      "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 " +
      (p.className || "")
    }
  />
);
export const Card = ({ children }: { children: React.ReactNode }) => (
  <section className="rounded-xl border bg-white p-5 shadow-sm">
    {children}
  </section>
);
