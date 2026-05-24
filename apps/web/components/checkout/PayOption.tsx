import React from "react";

interface PayOptionProps {
  selected: boolean;
  onClick?: () => void;
  iconBg: string;
  icon: React.ReactNode;
  name: string;
  desc: string;
  disabled?: boolean;
  soon?: boolean;
}

export default function PayOption({
  selected,
  onClick,
  iconBg,
  icon,
  name,
  desc,
  disabled,
  soon,
}: PayOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-3 p-3.5 rounded-xl border w-full text-left
        transition-all duration-150
        ${
          selected
            ? "border-orange-400 bg-orange-50/60 shadow-sm"
            : "border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      <div
        className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">
          {name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      {soon && (
        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 shrink-0">
          Sắp ra mắt
        </span>
      )}
      {!disabled && (
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "border-orange-500" : "border-gray-300"}`}
        >
          {selected && (
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          )}
        </div>
      )}
    </button>
  );
}
