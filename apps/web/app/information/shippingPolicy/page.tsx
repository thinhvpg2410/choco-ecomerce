export default function ShippingPolicy() {
  return (
    <div>
        <div className="w-full mx-auto py-4 px-30 text-sm text-gray-500 border-b-4 border-pink-100 rounded-full flex items-center gap-2">
            <a href="/" className="flex items-center">
                <img src="/image/home.png" alt="home" className="w-5 h-5"/>
            </a>
            <span>›</span>
            <a href="/information" className="hover:text-purple-800 font-bold ">Information</a>
            <span>›</span>
            <a href="/information/shippingPolicy" className="hover:text-purple-800 font-bold ">Shipping Policy</a>
        </div>

      {/* Title */}
      <div className="text-center py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          <span className="text-blue-500">Shipping</span>{" "}
          <span className="text-pink-500">Policy</span>
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto text-lg bg-white rounded-2xl shadow-[0_4px_20px_rgba(59,130,246,0.25),0_4px_20px_rgba(236,72,153,0.25)] p-8 text-black leading-relaxed space-y-6">

        <p>
          At <span className="font-semibold text-purple-500">Choco Kingdom</span>, we are dedicated to bringing the finest treats to your doorstep. To ensure your chocolates arrive in royal condition, we partner with reputable local and international couriers to provide fully tracked delivery services.
        </p>

        <div>
            <h2 className="text-xl font-bold text-purple-800 mb-3">
            1. Address Accuracy & Deliveries
            </h2>
            <p className="mt-3 text-lg">We ship exclusively to the exact address provided at checkout.</p>
            <ul className="pl-5 space-y-2">
            <li><span className="pl-5 font-semibold text-black-800">Correction:</span> If you notice a mistake in your address, please contact us immediately. While we will try our best to redirect the package, we cannot guarantee changes once the order is processed.</li>
            <li><span className="pl-5 font-semibold text-black-800">Liability:</span> Choco Kingdom accepts no liability for lost or misplaced parcels due to incorrect address or name information. </li>
            <li><span className="pl-5 font-semibold text-black-800">Full Names Required:</span> Per courier requirements, please provide a full legal name. Avoid using nicknames or fake names to ensure successful delivery.</li>
            <li><span className="pl-5 font-semibold text-black-800">Redelivery Fees:</span> If a parcel is returned to us due to an address error, your absence, or failure to collect from a pickup point, we can reship it to you. However, a relevant shipping fee will be charged.</li>
            
                <ul className="pl-5 space-y-2">
                <li><span className="pl-5 font-semibold text-gray-700">Domestic Reshipment:</span> A flat fee of 50,000 VND will apply for reshipping within Vietnam.</li>
                <li><span className="pl-5 font-semibold text-gray-700">International Reshipment:</span> For international orders, the reshipping fee will depend on the destination and weight of the package. Please contact our customer service for a quote.</li>
                </ul>
            </ul>
        </div>

        {/* 2 */}
        <div>
            <h2 className="text-xl font-bold text-pink-500 mb-3">
            2. Failed Deliveries & Refunds
            </h2>

            <ul className="space-y-2">
            <li><span className="font-semibold">Successful Delivery:</span> Delivery to a pickup point is considered complete.</li>
            <li><span className="font-semibold">Lost Parcels:</span> We will resend the order instead of issuing a refund.</li>
            <li><span className="font-semibold">No Refunds:</span> Orders failed due to customer errors are not refundable.</li>
            </ul>
        </div>

        {/* 3 */}
        <div>
            <h2 className="text-xl font-bold text-blue-500 mb-3">
            3. International Shipping & Customs
            </h2>

            <ul className="space-y-2">
            <li>Customers must pay all customs duties, taxes, or import fees.</li>
            <li>We are not responsible for customs delays or rejections.</li>
            <li>No refunds for returned items due to unpaid customs (perishable goods).</li>
            </ul>
        </div>

        {/* 4 */}
        <div>
            <h2 className="text-xl font-bold text-pink-500 mb-3">
            4. Product Integrity & Weather Conditions
            </h2>

            <ul className="space-y-2">
            <li><span className="font-semibold">Melting Risk:</span> Chocolate may melt in hot conditions.</li>
            <li><span className="font-semibold">Fragility:</span> Some items may break during shipping.</li>
            <li><span className="font-semibold">Consumability:</span> No refunds for cosmetic damage that doesn’t affect quality.</li>
            </ul>
        </div>

        {/* 5 */}
        <div>
            <h2 className="text-xl font-bold text-blue-500 mb-3">
            5. Dispatch & Delivery Timelines
            </h2>

            <ul className="space-y-2">
            <li>Domestic dispatch: 1–3 working days</li>
            <li>International dispatch: 1–14 working days</li>
            <li>Shipping days: Monday–Friday only</li>
            <li>No refunds for delays caused by external factors</li>
            </ul>
        </div>

        {/* 6 */}
        <div>
            <h2 className="text-xl font-bold text-pink-500 mb-3">
            6. Restricted Addresses
            </h2>

            <p>
            We do not ship to PO Boxes, APO, FPO, or similar addresses. Please provide a valid residential or business address. Orders with invalid addresses may be delayed.
            </p>
        </div>

        {/* Contact */}
        <div>
            <h2 className="text-xl font-bold text-blue-500 mb-3">
            Contact Us
            </h2>

            <p>
            Email:{" "}
            <span className="font-semibold text-pink-500">
                hello@chocokingdom.vn
            </span>
            </p>

            <p className="mt-1 text-gray-600">
            Location: Ho Chi Minh City, Vietnam
            </p>
        </div>

      </div>
    </div>
  );
}