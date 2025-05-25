import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProductById } from '@/api/products';
import { createReview } from '@/api/review';
import Modal from './Modal';
import StarRating from './StarRating';
import Textarea from './Textarea';
import ImageUploader from './ImageUploader';
import { useModal } from '@/context/ModalContext';

type productDetailProps = {
  productId: number;
};

function ProductReview({ productId }: productDetailProps) {
  const [productImages, setProductImages] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const { closeModal } = useModal();

  const queryClient = useQueryClient();

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      alert('리뷰 등록 성공!');
      setReviewText('');
      setRating(0);
      setProductImages([]);
      queryClient.invalidateQueries({
        queryKey: ['reviews', productId],
      });
      closeModal();
    },
    onError: (error) => {
      console.error('리뷰 등록 실패', error);
      alert('리뷰 등록 중 오류 발생!');
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['productDetail', productId],
    queryFn: () => getProductById(productId),
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>에러가 발생했습니다.</div>;
  if (!data) return <div>상품 정보를 불러오지 못했습니다.</div>;

  const validateReviewText = () => {
    if (!reviewText.trim()) {
      alert('리뷰 내용을 입력해 주세요.');
    } else if (reviewText.trim().length < 10) {
      alert('최소 10자 이상 적어주세요.');
    }
  };

  const validateReviewForm = () => {
    const errors: string[] = [];

    if (!reviewText.trim()) {
      errors.push('리뷰 내용을 입력해 주세요.');
    } else if (reviewText.trim().length < 10) {
      errors.push('최소 10자 이상 적어주세요.');
    }

    if (!rating) {
      errors.push('별점으로 상품을 평가해 주세요.');
    }

    if (productImages.length === 0) {
      errors.push('사진을 1장 이상 업로드 해주세요.');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return false;
    }

    return true;
  };

  const submitReviewForm = () => {
    const valid = validateReviewForm();
    if (!valid) {
      return;
    }

    const reviewPayload = {
      productId,
      images: productImages,
      content: reviewText,
      rating,
    };

    submitReview(reviewPayload);
  };

  return (
    <Modal buttonText="작성하기" buttonProps={{ onClick: submitReviewForm, disabled: isPending }}>
      <div>
        <div className="inline-flex justify-center text-center min-w-[58px] h-[22px] rounded-[6px] px-2 py-1 font-normal text-xs text-[#23B581] bg-[#23B581]/10 mb-[10px]">
          {data.category.name}
        </div>
        <div className="font-semibold text-gray-50 text-xl lg:text-2xl mb-5 md:mb-10">
          {data.name}
        </div>
      </div>
      <div className="flex items-center gap-[15px] w-[188px] h-7 mb-[10px] md:w-[208px] md:h-8 md:mb-[15px] lg:w-[228px] lg:gap-5 lg:mb-5">
        <p className="font-normal text-gray-200 text-sm lg:text-base whitespace-nowrap">별점</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <Textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        containerClassName="mb-[10px] md:mb-[15px] lg:mb-5"
        maxLength={300}
        onBlur={validateReviewText}
      />
      <ImageUploader
        isSingleImage={false}
        images={productImages}
        onUploadImages={(urls) => setProductImages(urls)}
        onRemoveImages={(index) => {
          setProductImages((prev) => prev.filter((_, i) => i !== index));
        }}
      />
    </Modal>
  );
}

export default ProductReview;
