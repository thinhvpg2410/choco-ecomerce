import React from "react";

interface SectionProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  badge?: number;
  right?: React.ReactNode;
  children: React.ReactNode;
}

export default function Section({
  icon,
  iconBg,
  title,
  badge,
  right,
  children,
}: SectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}
          >
            {icon}
          </div>
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            {title}
          </span>
          {badge !== undefined && (
            <span className="bg-orange-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5 leading-none">
              {badge}
            </span>
          )}
        </div>
        {right}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
