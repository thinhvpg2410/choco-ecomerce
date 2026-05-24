interface SumRowProps {
  label: string;
  value: string;
  green?: boolean;
  strong?: boolean;
}

export default function SumRow({ label, value, green, strong }: SumRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span
        className={`text-sm ${strong ? "font-bold text-gray-900" : "text-gray-500"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${green ? "text-emerald-600" : strong ? "text-gray-900" : "text-gray-800"}`}
      >
        {value}
      </span>
    </div>
  );
}
