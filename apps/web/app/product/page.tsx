import React from "react";
import { products } from "@/types/dataTest";
import { ProductList } from "@/components/product/product-list";
import { HeroBanner } from "@/components/ui/hero-banner";

const ProductPage = () => {
  return (
    <div>
      <HeroBanner
        image="https://images.unsplash.com/photo-1549007994-cb92caebd54b"
        title="Sản phẩm"
      />

      <div className="p-6">
        <h2 className="mb-4 text-xl font-semibold">All Products</h2>
        <ProductList products={products} />
      </div>
    </div>
  );
};

export default ProductPage;
