import React, { useState } from 'react';
import ProductDetail from '@/components/products/ProductDetail';
import ProductStatistics from '@/components/products/ProductStatistics';
import ProductReviews from '@/components/products/ProductReviews';
import ReviewSortDropdown from '@/components/products/ReviewSortDropdown';

interface ProductDetailLayoutProps {
  id: number;
}

type SortOrder = 'recent' | 'ratingDesc' | 'ratingAsc' | 'likeCount';

const SORT_OPTIONS = [
  { value: 'recent' as const, label: '최신순' },
  { value: 'ratingDesc' as const, label: '별점 높은순' },
  { value: 'ratingAsc' as const, label: '별점 낮은순' },
  { value: 'likeCount' as const, label: '좋아요순' },
] as const;

export default function ProductDetailLayout({ id }: ProductDetailLayoutProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');

  return (
    <div className="min-h-screen text-gray-50">
      <div className="w-full max-w-[1920px] mx-auto px-4 lg:px-8 py-4 lg:py-8 flex flex-col items-center">
        <div className="w-full max-w-[940px]">
          <ProductDetail id={id} />
          <ProductStatistics id={id} />

          <div className="w-full mx-auto mb-4 lg:mb-8">
            <div className="flex justify-between items-center gap-3 mb-[30px]">
              <h2 className="text-[16px] font-semibold text-gray-50">상품 리뷰</h2>
              <ReviewSortDropdown
                options={SORT_OPTIONS}
                value={sortOrder}
                onChange={setSortOrder}
              />
            </div>
            <ProductReviews id={id} order={sortOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}
