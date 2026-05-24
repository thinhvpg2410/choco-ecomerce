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
    <div className="bg-white rounded-[18px] border border-[#ebebeb] overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-[10px] ${iconBg} flex items-center justify-center`}
          >
            {icon}
          </div>

          <span className="text-[14px] font-bold text-gray-900">{title}</span>

          {badge !== undefined && (
            <span className="bg-rose-500 text-white text-[11px] font-extrabold rounded-full px-2 py-0.5">
              {badge}
            </span>
          )}
        </div>

        {right}
      </div>

      <div className="px-4 py-3.5">{children}</div>
    </div>
  );
}
