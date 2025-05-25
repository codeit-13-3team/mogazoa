import { useModal } from '@/context/ModalContext';
import Modal from './Modal';
import router from 'next/router';

const ProductReplacementAlertModal = () => {
  const { closeModal } = useModal();

  const moveToComparePage = () => {
    closeModal();
    router.push('/compare');
  };
  return (
    <Modal buttonText="바로가기" buttonProps={{ onClick: moveToComparePage }}>
      <div className="mb-[20px] text-[16px] md:text-[24px] text-gray-50 font-semibold">
        <p>비교할 상품이 없습니다.</p>
        <p>비교하기 페이지로 이동하시겠습니까?</p>
      </div>
    </Modal>
  );
};

export default ProductReplacementAlertModal;
