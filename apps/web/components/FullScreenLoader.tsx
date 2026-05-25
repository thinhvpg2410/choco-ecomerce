"use client";

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1a0f0a]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-[#f59e0b]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-5">
        {/* Spinner stack */}
        <div className="relative w-14 h-14">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "rgba(245, 158, 11, 0.25)", // caramel
              borderRightColor: "rgba(245, 158, 11, 0.15)",
              animation: "spin 2.5s linear infinite reverse",
            }}
          />

          {/* Middle ring */}
          <div
            className="absolute inset-[5px] rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "rgba(251, 113, 133, 0.6)", // strawberry
              animation: "spin 1.5s linear infinite",
            }}
          />

          {/* Inner ring */}
          <div
            className="absolute inset-[10px] rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "#f59e0b", 
              borderRightColor: "#fb7185", 
              animation: "spin 0.8s linear infinite",
            }}
          />

          {/* Center dot */}
          <div className="absolute inset-[19px] rounded-full bg-[#fb7185] shadow-lg shadow-[#fb7185]/40" />
        </div>

        {/* Label */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#ffe4c7] text-[11px] font-medium tracking-[0.2em] uppercase">
            Đang tải
          </span>

          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-[#f59e0b]"
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
