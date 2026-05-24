import api from "@/services/axios";

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface CreateReviewDto {
  product_id: string;
  order_item_id: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

export interface ReviewListResponse {
  items: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

//REVIEWS SERVICE

export const createReview = async (dto: CreateReviewDto): Promise<Review> => {
  try {
    const res = await api.post("/reviews", dto);
    return res.data?.data || res.data;
  } catch (error: any) {
    console.error("Create review error:", error?.response?.data || error);
    throw error;
  }
};

export const updateReview = async (
  reviewId: string,
  dto: UpdateReviewDto,
): Promise<Review> => {
  try {
    const res = await api.put(`/reviews/${reviewId}`, dto);
    return res.data?.data || res.data;
  } catch (error: any) {
    console.error("Update review error:", error?.response?.data || error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string): Promise<boolean> => {
  try {
    const res = await api.delete(`/reviews/${reviewId}`);
    return res.data?.success || true;
  } catch (error: any) {
    console.error("Delete review error:", error?.response?.data || error);
    throw error;
  }
};

export const getProductReviews = async (
  productId: string,
  params: { page?: number; limit?: number } = {},
): Promise<ReviewListResponse> => {
  try {
    const res = await api.get(`/products/${productId}/reviews`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });

    return (
      res.data?.data || {
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      }
    );
  } catch (error: any) {
    console.error(
      "Get product reviews error:",
      error?.response?.data || error,
    );
    return {
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
};

// Lấy review của user cho 1 sản phẩm (nếu cần kiểm tra đã review chưa)
export const getMyReviewForProduct = async (
  productId: string,
): Promise<Review | null> => {
  try {
    const res = await api.get(`/reviews/me/product/${productId}`);
    return res.data?.data || null;
  } catch (error: any) {
    console.error("Get my review error:", error?.response?.data || error);
    return null;
  }
};

export const getMyReviewForOrderItem = async (
  orderItemId: string,
): Promise<Review | null> => {
  try {
    const res = await api.get(`/reviews/me/order-item/${orderItemId}`);
    return res.data?.data || null;
  } catch (error: any) {
    return null;
  }
};


