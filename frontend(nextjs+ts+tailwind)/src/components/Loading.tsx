"use client";

type LoadingProps = {
  text?: string;
  fullScreen?: boolean;
};

export default function Loading({
  text = "Loading...",
  fullScreen = false,
}: LoadingProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen" : "min-h-[300px]"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">{text}</p>
          <p className="mt-1 text-xs text-slate-400">Please wait a moment...</p>
        </div>
      </div>
    </div>
  );
}
