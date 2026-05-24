interface SumRowProps {
  label: string;
  value: string;
  green?: boolean;
}

export default function SumRow({ label, value, green }: SumRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[13.5px] text-gray-500">{label}</span>

      <span
        className={`text-[13.5px] font-semibold ${
          green ? "text-green-600" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
