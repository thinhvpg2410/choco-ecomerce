import { products, categories, brands } from "@/types/dataTest";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = products.find((p) => p.id === id);
  if (!product) return notFound();

  const category = categories.find((c) => c.id === product.category_id);
  const brand = brands.find((b) => b.id === product.brand_id);

  const hasSale =
    product.sale_price != null && product.sale_price < product.price;

  return (
    <div className="container mx-auto px-6 py-12 min-h-screen">
      <div className="grid md:grid-cols-2 gap-14 items-start">
        {/* LEFT - IMAGE */}
        <div className="bg-gray-100 rounded-3xl overflow-hidden shadow-lg h-[500px] md:h-[650px] flex items-center justify-center">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain p-10 transition duration-500 hover:scale-105"
          />
        </div>

        {/* RIGHT - INFO */}
        <div className="flex flex-col gap-6">
          {/* NAME */}
          <h1 className="text-4xl font-bold leading-tight">{product.name}</h1>

          {/* BRAND + CATEGORY */}
          <p className="text-gray-500 text-sm">
            {brand?.name} • {category?.name}
          </p>

          {/* DESCRIPTION */}
          <div className="bg-gray-50 border rounded-xl p-5 text-gray-700 leading-relaxed shadow-sm h-[180px] overflow-y-auto">
            {product.description}
          </div>
          {/* PRICE */}
          <div className="flex items-center gap-4">
            {hasSale ? (
              <>
                <span className="text-3xl font-bold text-red-600">
                  {product.sale_price!.toLocaleString()}đ
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {product.price.toLocaleString()}đ
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-800">
                {product.price.toLocaleString()}đ
              </span>
            )}
          </div>

          {/* PACKAGE TYPE */}
          <div>
            <p className="font-semibold mb-2 text-gray-800">Loại sản phẩm</p>
            <div className="inline-flex items-center border border-red-400 text-red-500 px-5 py-2 rounded-lg relative text-sm font-medium">
              <Check className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-4 h-4 p-[2px]" />
              {product.package_type}
            </div>
          </div>

          {/* WEIGHT */}
          <div>
            <p className="font-semibold mb-2 text-gray-800">Trọng lượng</p>
            <div className="flex gap-3 flex-wrap">
              {product.weight.map((w, index) => (
                <div
                  key={index}
                  className={`px-5 py-2 rounded-lg border cursor-pointer text-sm font-medium transition
                  ${
                    index === 0
                      ? "border-red-400 text-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {w}
                  {product.weight_unit}
                </div>
              ))}
            </div>
          </div>

          {/* BUTTON */}
          <Button className="mt-4 w-fit px-8 py-6 text-base flex gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-md">
            <ShoppingCart className="w-5 h-5" />
            Thêm vào giỏ hàng
          </Button>
        </div>
      </div>
    </div>
  );
}
