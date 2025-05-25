import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../Modal';
import { useModal } from '@/context/ModalContext';
import { deleteReview } from '@/api/review';

type productDetailProps = {
  productId: number;
  reviewId: number;
};

const ReviewDeleteConfirm = ({ productId, reviewId }: productDetailProps) => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const deleteReviewMutation = useMutation({
    mutationFn: () => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reviews', productId],
      });
      closeModal();
    },
    onError: (error: any) => {
      console.error('리뷰 삭제 실패', error);
      alert('리뷰 삭제 중 오류 발생!');
    },
  });

  const onClickDeleteReview = () => {
    deleteReviewMutation.mutate();
  };

  return (
    <Modal
      buttonText="삭제"
      buttonProps={{ onClick: onClickDeleteReview, disabled: deleteReviewMutation.isPending }}
    >
      <div className="mb-[20px] text-[16px] md:text-[24px] text-gray-50 font-semibold">
        <p>한번 삭제한 리뷰는 복구할 수 없습니다.</p>
        <p>정말 삭제 하시겠습니까?</p>
      </div>
    </Modal>
  );
};

export default ReviewDeleteConfirm;
