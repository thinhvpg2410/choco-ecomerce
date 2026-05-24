"use client";

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-5">
        {/* Spinner stack */}
        <div className="relative w-14 h-14">
          {/* Outer ring - slow */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "rgba(99,102,241,0.2)",
              borderRightColor: "rgba(99,102,241,0.2)",
              animation: "spin 2.5s linear infinite reverse",
            }}
          />
          {/* Middle ring - medium */}
          <div
            className="absolute inset-[5px] rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "rgba(139,92,246,0.5)",
              animation: "spin 1.5s linear infinite",
            }}
          />
          {/* Inner ring - fast */}
          <div
            className="absolute inset-[10px] rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "#6366f1",
              borderRightColor: "#6366f1",
              animation: "spin 0.8s linear infinite",
            }}
          />
          {/* Center dot */}
          <div className="absolute inset-[19px] rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
        </div>

        {/* Label */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 text-[11px] font-medium tracking-[0.2em] uppercase">
            Đang tải
          </span>
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-zinc-500"
                style={{
                  animation: "pulse 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
