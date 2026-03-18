"use client";

interface Props {
  image: string;
  title: string;

}

export function HeroBanner({ image, title }: Props) {
  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {/* IMAGE */}
      <img src={image} alt="banner" className="w-full h-full object-cover" />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/40" />

      {/* TEXT */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
        <span className="text-sm tracking-[4px]  text-orange-300 mb-2">
          ChocoShop
        </span>

        <h1
          className="
            text-5xl md:text-7xl 
            font-[cursive] 
            italic 
            drop-shadow-lg
          "
        >
          {title}
        </h1>

        <div className="w-16 h-[2px] bg-white mt-4" />
      </div>
    </div>
  );
}
