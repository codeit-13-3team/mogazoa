import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewListItem } from '@/types/product';
import axiosInstance from '@/api/axiosInstance';
import ProductReview from './ProductReview';

export interface ProductReviewsProps {
  id: number;
  order?: 'recent' | 'ratingDesc' | 'ratingAsc' | 'likeCount';
}

export default function ProductReviews({ id, order = 'recent' }: ProductReviewsProps) {
  const { data: reviews, isLoading } = useQuery<ReviewListItem[]>({
    queryKey: ['reviews', id, order],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        list: ReviewListItem[];
      }>(`/products/${id}/reviews`, {
        params: { order },
      });
      return response.data.list;
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <section className="w-[940px] mx-auto min-h-[120px] flex items-center justify-center text-gray-400">
        로딩 중...
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <section className="max-w-[940px] mx-auto">
        <div className="bg-black-400 rounded-xl p-8">
          <div className="text-gray-400 text-center py-8">리뷰가 없습니다</div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[940px] mx-auto">
      <div className="flex flex-col gap-[15px] ">
        {reviews.map((review, index) => (
          <div key={index} className=" bg-black-400 p-5 rounded-[12px] border border-black-300">
            <ProductReview review={review} id={id} order={order} />
          </div>
        ))}
      </div>
    </section>
  );
}
