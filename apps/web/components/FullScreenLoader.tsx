export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
      {/* Container chính */}
      <div className="flex flex-col items-center gap-6">
        {/* Spinner to và đẹp hơn */}
        <div className="relative w-20 h-20">
          {/* Vòng ngoài */}
          <div className="absolute inset-0 w-20 h-20 border-8 border-pink-200 rounded-full" />

          {/* Vòng xoay chính */}
          <div className="absolute inset-0 w-20 h-20 border-8 border-pink-500 border-t-transparent rounded-full animate-spin" />

         
        </div>

        {/* Text loading */}
        <div className="text-pink-600 font-medium tracking-widest text-sm">
          ĐANG TẢI...
        </div>
      </div>
    </div>
  );
}
