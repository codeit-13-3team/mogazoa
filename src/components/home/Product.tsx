import Image from 'next/image';
import star from '../../../public/icon/common/star.png';
import { Product as ProductType } from '@/types/product';
import Link from 'next/link';

type ProductProps = {
  product: ProductType;
};

const Product = ({ product }: ProductProps) => {
  return (
    <li
      key={product.id}
      className="border border-black-300 bg-black-400 rounded-[8px] lg:max-w-[300px] w-full list-none"
    >
      <Link href={`/products/${product.id}`} className="text-inherit hover:no-underline">
        <div className="flex justify-center p-[10px] pb-[0px] lg:p-2 lg:pb-[0px] aspect-video w-full">
          <Image
            src={product.image}
            alt="상품 이미지"
            width={135}
            height={100}
            className="object-contain w-auto max-w-[270px] max-h-[200px]"
          />
        </div>
        <div className="p-[10px] md:p-[20px] lg:p-[25px]">
          <p className="font-medium block truncate text-[14px] md:text-[16px] lg:text-[18px] mb-[5px] md:mb-[10px]">
            {product.name}
          </p>

          <div className="flex flex-col md:flex-row gap-[10px] text-[12px] md:text-[14px] lg:text-[16px] font-light text-gray-200 justify-between">
            <div className="flex gap-[10px]">
              <div className="flex gap-[5px] flex-shrink-0">
                <p>리뷰</p>
                <p>{product.reviewCount}</p>
              </div>
              <div className="flex gap-[5px] flex-shrink-0">
                <p>찜</p>
                <p>{product.favoriteCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-[2px]">
              <Image
                src={star}
                alt="별 아이콘"
                width={12}
                height={12}
                className="w-[15px] h-[15px]"
              />
              <p>{product.rating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default Product;
