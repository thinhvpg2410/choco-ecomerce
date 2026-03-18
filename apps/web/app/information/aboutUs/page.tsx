export default function AboutPage() {
  return (
    <div>
        <div className="w-full mx-auto py-4 px-30 text-sm text-gray-500 border-b-4 border-pink-100 rounded-full flex items-center gap-2">
            <a href="/" className="flex items-center">
                <img src="/image/home.png" alt="home" className="w-5 h-5"/>
            </a>
            <span>›</span>
            <a href="/information" className="hover:text-purple-800 font-bold ">Information</a>
            <span>›</span>
            <a href="/information/aboutUs" className="hover:text-purple-800 font-bold ">About Us</a>
        </div>
        <div className=" min-h-screen">
            <div className="text-center pt-4 pb-10">
                <h1 className="text-5xl font-extrabold">
                    <span className="text-blue-500">Choco</span>{" "}
                    <span className="text-pink-500">Kingdom</span>
                </h1>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 rounded-lg bg-white shadow-[0_4px_20px_rgba(59,130,246,0.25),0_4px_20px_rgba(236,72,153,0.25)]">
                <div className="pt-1 pb-10 px-10 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-purple-800 mb-4">
                        ABOUT THE COMPANY
                    </h2>

                    <p className="text-gray-600 leading-relaxed">
                        Choco Kingdom was founded with the mission of bringing a sweet
                        world of chocolates and candies to everyone.
                    </p>

                    <p className="mt-4 text-gray-600">
                        We offer a wide range of delightful treats such as chocolates,
                        candies, cookies, snacks, and special gift boxes for many
                        different occasions.
                    </p>

                    <p className="mt-4 text-gray-600">
                        Choco Kingdom is not just a place to buy sweets, but a
                        <span className="font-semibold text-pink-500">
                        {" "}“Sweet Kingdom”
                        </span>{" "}
                        where everyone can find joy in every little treat.
                    </p>
                </div>

                <img src="/image/company.png" alt="company" className="w-full h-full object-cover"/>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 rounded-lg bg-white mt-10 shadow-[0_4px_20px_rgba(59,130,246,0.25),0_4px_20px_rgba(236,72,153,0.25)]">
                <img src="/image/partner.jpeg" alt="vision" className="w-full h-auto object-cover"/>

                <div className="pt-1 pb-10 px-10 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-purple-800 mb-4">
                        VISION
                    </h2>

                    <p className="text-gray-600">
                        To become one of the most trusted and beloved confectionery
                        brands in the market.
                    </p>

                    <p className="mt-4 text-gray-600">
                        Choco Kingdom strives to build a brand that provides an
                        enjoyable shopping experience while offering high-quality
                        confectionery products.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 rounded-lg bg-white mt-10 shadow-[0_4px_20px_rgba(59,130,246,0.25),0_4px_20px_rgba(236,72,153,0.25)]">

                <div className="pt-1 pb-10 px-10 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-purple-800 mb-4">
                        MISSION
                    </h2>

                    <p className="text-gray-600">
                        The mission of Choco Kingdom is to bring sweetness and
                        happiness to every moment of life.
                    </p>

                    <p className="mt-4 text-gray-600">
                        We are committed to selecting and providing confectionery
                        products that ensure quality, food safety, and satisfaction
                        for customers.
                    </p>
                </div>

                <img src="/image/Business.jpg" alt="mission" className="w-full h-full object-cover" />
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 rounded-lg bg-white mt-10 mb-16 shadow-[0_4px_20px_rgba(59,130,246,0.25),0_4px_20px_rgba(236,72,153,0.25)]">
                <img src="/image/benefit.jpg" alt="ethics" className="w-full h-auto object-cover"/>

                <div className="pt-1 pb-10 px-10 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-purple-800 mb-4">
                        BUSINESS ETHICS
                    </h2>

                    <p className="text-gray-600">
                        Choco Kingdom always puts quality and customer trust as the
                        top priorities.
                    </p>

                    <p className="mt-4 text-gray-600">
                        Our philosophy is to create difference through quality,
                        service, and customer experience.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}