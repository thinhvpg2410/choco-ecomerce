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
      className={`flex items-center gap-3 p-3 rounded-2xl border-[1.5px] w-full text-left transition-all ${
        selected ? "border-rose-400 bg-rose-50/50" : "border-gray-100"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-200"}`}
    >
      <div
        className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-[13px] font-bold text-gray-900">{name}</p>

        <p className="text-[11.5px] text-gray-400 mt-0.5">{desc}</p>
      </div>

      {soon && (
        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
          Sắp ra mắt
        </span>
      )}

      {!disabled && (
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            selected ? "border-rose-500" : "border-gray-200"
          }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
        </div>
      )}
    </button>
  );
}
