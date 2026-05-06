import Link from "next/link"

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/image/bg404.png')"
      }}
    >
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-6">

      <h1 className="text-lg tracking-widest text-gray-700 font-semibold">
        TRANG KHÔNG TỒN TẠI
      </h1>

      <img
        src="/image/errorPage.png"
        alt="404 beaver"
        className="w-[450px] max-w-full mt-6"
      />

      <p className="mt-6 text-gray-800 text-lg">
        Oops!! Trang bạn đang tìm kiếm không tồn tại hoặc có thể đã được chuyển đi.
      </p>

      <Link
        href="/"
        className="mt-8 px-6 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition"
      >
        Get back to homepage
      </Link>

    </div>
    </div>
  )
}