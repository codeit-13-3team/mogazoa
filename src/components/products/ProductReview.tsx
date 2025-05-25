import { ReviewListItem } from '@/types/product';
import Image from 'next/image';
import StarRating from '../StarRating';
import thumbsUp from '../../../public/icon/common/up.png';
import activeThumbsUp from '../../../public/icon/common/up2.png';
import axiosInstance from '@/api/axiosInstance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useModal } from '@/context/ModalContext';
import EditProductReview from '../EditProductReviewModal';
import ReviewDeleteConfirm from './ReviewDeleteConfirm';

interface reviewProps {
  review: ReviewListItem;
  id: number;
  order?: 'recent' | 'ratingDesc' | 'ratingAsc' | 'likeCount';
}

const likeReview = async (reviewId: number): Promise<void> => {
  await axiosInstance.post(`/reviews/${reviewId}/like`);
};

const unlikeReview = async (reviewId: number): Promise<void> => {
  await axiosInstance.delete(`/reviews/${reviewId}/like`);
};

const ProductReview = ({ review, id, order = 'recent' }: reviewProps) => {
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  const [user, setUser] = useState<{ id: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        setUser(null);
      }
    }
  }, []);

  if (!review.user) return null;

  const likeReviewMutation = useMutation<void, Error, number>({
    mutationFn: likeReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id, order] });
    },
  });

  const unlikeReviewMutation = useMutation<void, Error, number>({
    mutationFn: unlikeReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id, order] });
    },
  });

  const handleLikeClick = (reviewId: number, isLiked: boolean) => {
    if (isLiked) {
      unlikeReviewMutation.mutate(reviewId);
    } else {
      likeReviewMutation.mutate(reviewId);
    }
  };

  const formattedDate = (date: any) => {
    const reviewDate = new Date(date);
    return reviewDate.toISOString().slice(0, 10);
  };

  const editReview = (data: {
    articleId: number;
    reviewImages: { source: string; id: number }[];
    rating: number;
    content: string;
  }) => {
    openModal(
      <EditProductReview
        productId={id}
        articleId={data.articleId}
        reviewImages={data.reviewImages}
        content={data.content}
        rating={data.rating}
      />,
    );
  };

  const openDeleteModal = () => {
    openModal(<ReviewDeleteConfirm productId={id} reviewId={review?.id} />);
  };

  return (
    <article key={review.id}>
      <div className="md:flex md:justify-between">
        <div className="md:mr-[30px] lg:mr-[80px]">
          <div className="flex items-center gap-[10px] mb-4">
            <div className="w-[36px] h-[36px]">
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.nickname}
                  width={36}
                  height={36}
                  className="w-[36px] h-[36px] object-cover rounded-full overflow-hidden"
                />
              ) : (
                <div className="bg-gray-50 rounded-full w-[36px] h-[36px]" />
              )}
            </div>
            <div className="flex-shrink-0">
              <div className="mb-[5px] text-[14px] text-gray-50">{review.user.nickname}</div>
              <StarRating value={review.rating} starClassName="w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="text-[12px] lg:text-[16px] text-gray-50 mb-5">{review.content}</div>

          {review.reviewImages.length > 0 && (
            <div className="flex gap-[10px] mb-5">
              {review.reviewImages.map((image) => (
                <Image
                  key={image.id}
                  src={image.source}
                  alt="리뷰 이미지"
                  width={60}
                  height={60}
                  className="h-[60px] md:w-20 md:h-20 lg:w-[100px] lg:h-[100px] object-cover rounded-lg overflow-hidden"
                />
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <div className="flex items-end">
              <div className="text-[12px] lg:text-[14px] text-gray-200 mr-[15px]">
                {formattedDate(review.createdAt)}
              </div>

              {review.user.id === user?.id && (
                <>
                  <span
                    onClick={() =>
                      editReview({
                        articleId: review.id,
                        reviewImages: review.reviewImages,
                        content: review.content,
                        rating: review.rating,
                      })
                    }
                    className="text-[12px] lg:text-[14px] font-light text-gray-100 underline cursor-pointer mr-[10px]"
                  >
                    수정
                  </span>
                  <span
                    className="text-[12px] lg:text-[14px] font-light text-gray-100 underline cursor-pointer"
                    onClick={openDeleteModal}
                  >
                    삭제
                  </span>
                </>
              )}
            </div>

            <div
              className="py-[6px] px-[10px] flex items-center gap-[5px] border border-black-300 rounded-full cursor-pointer"
              onClick={() => handleLikeClick(review.id, review.isLiked)}
            >
              {review.isLiked ? (
                <div className="flex items-center gap-[5px]">
                  <Image
                    src={activeThumbsUp}
                    alt="좋아요 아이콘"
                    width={14}
                    height={14}
                    className="lg:w-[18px] lg:h-[18px]"
                  />
                  <span className="text-[12px] lg:text-[14px] bg-gradient-to-r from-main-blue to-main-indigo bg-clip-text text-transparent">
                    {review.likeCount}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-[5px]">
                  <Image
                    src={thumbsUp}
                    alt="좋아요 아이콘"
                    width={14}
                    height={14}
                    className="lg:w-[18px] lg:h-[18px]"
                  />
                  <span className="text-[12px] lg:text-[14px] text-gray-100">
                    {review.likeCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductReview;
