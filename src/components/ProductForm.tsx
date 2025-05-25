import { DropDown, DropDownOption } from '@/components/DropDown';
import Textarea from '@/components/Textarea';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { createProduct, getProductList, updateProduct } from '@/api/products';
import { getCategoryList } from '@/api/category';
import { ProductResponse, CreateProductRequest } from '@/types/product';
import router from 'next/router';
import { useModal } from '@/context/ModalContext';
import Input from '@/components/input/input';
import Button from '@/components/button/Button';
import ImageUploader from '@/components/ImageUploader';

interface ProductProps {
  selectedProduct?: ProductResponse | undefined;
}

const ProductForm = ({ selectedProduct }: ProductProps) => {
  const queryClient = useQueryClient();
  const [productName, setProductName] = useState<string>('');
  const [productDescript, setProductDescript] = useState<string>('');
  const [productCategory, setProductCategory] = useState<string | number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedSearch = useDebounce(productName, 300);
  const [productImage, setproductImage] = useState<string>('');
  const { closeModal } = useModal();

  const [productNameError, setProductNameError] = useState<string>('');
  const [productDescriptError, setProductDescriptError] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedProduct) {
      setProductName(selectedProduct.name);
      setProductDescript(selectedProduct.description);
      setProductCategory(selectedProduct.categoryId);
      setproductImage(selectedProduct.image);
    } else {
      setProductName('');
      setProductDescript('');
      setProductCategory(1);
      setproductImage('');
    }
  }, [selectedProduct]);

  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => getProductList(debouncedSearch),
    enabled: !!debouncedSearch,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: categoryData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoryList,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const createM = useMutation({
    mutationFn: async (body: CreateProductRequest) => createProduct(body),
    onSuccess: (newProd) => {
      closeModal();
      router.push(`/products/${newProd.id}`);
    },
  });

  const updateM = useMutation({
    mutationFn: async (body: CreateProductRequest) => updateProduct(selectedProduct!.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', selectedProduct!.id] });
      closeModal();
    },
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDuplicate = productData?.list?.some(
    (product) => product.name === productName && product.id !== selectedProduct?.id,
  );

  const handleProductName = () => {
    if (isDuplicate) {
      setProductNameError('이미 등록된 상품입니다.');
    } else if (!productName) {
      setProductNameError('상품 이름은 필수 입력입니다.');
    } else {
      setProductNameError('');
    }
  };

  const handleProductDescription = () => {
    if (!productDescript) {
      setProductDescriptError('상품 설명은 필수 입력입니다.');
    } else if (productDescript.length < 10) {
      setProductDescriptError('최소 10자 이상 적어주세요.');
    } else {
      setProductDescriptError('');
    }
  };

  const isFormValid =
    !productNameError &&
    !productDescriptError &&
    productName !== '' &&
    productDescript !== '' &&
    productCategory !== 0 &&
    productImage !== '' &&
    !isDuplicate;

  const handleSubmit = () => {
    const body: CreateProductRequest = {
      name: productName,
      description: productDescript,
      categoryId: Number(productCategory),
      image: productImage,
    };

    if (selectedProduct) {
      updateM.mutate(body);
    } else {
      createM.mutate(body);
    }
  };

  const handleUploadImage = (url: string) => {
    setproductImage(url);
  };
  const handleRemoveImage = () => {
    setproductImage('');
  };

  return (
    <>
      <h3 className="text-[20px] font-semibold mb-5 md:mb-10 lg:text-[24px] text-gray-50">
        상품 {selectedProduct ? '편집' : '추가'}
      </h3>
      <div className="flex flex-col gap-[10px] md:flex-row-reverse mg:gap-[15px] md:items-end">
        <div className="flex flex-col gap-[10px]">
          <ImageUploader
            image={productImage}
            onUploadImage={handleUploadImage}
            onRemoveImage={handleRemoveImage}
            errorMessage={!productImage ? '대표 이미지를 추가해주세요.' : undefined}
          />
        </div>
        <div className="flex flex-col gap-[10px] w-full md:gap-[15px]">
          <div className="relative">
            <Input
              ref={inputRef}
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                if (productName) setIsDropdownOpen(true);
              }}
              onBlur={handleProductName}
              placeholder="상품명 (상품 등록 여부를 확인해 주세요)"
              error={productNameError ? productNameError : undefined}
            />

            {isDropdownOpen && productData?.list && (
              <div
                ref={dropdownRef}
                className="absolute border border-black-300 bg-black-400 rounded-[8px] text-gray-50 text-[14px] z-50 w-full mt-[5px]"
              >
                {isProductLoading ? (
                  <p className="text-[14px] md:text-[16px] text-gray-50 bg-red">검색 중...</p>
                ) : (
                  <ul className="flex flex-col gap-[5px] p-[10px] max-h-[163px] overflow-y-scroll">
                    {productData?.list?.map((item) => (
                      <li
                        key={item.id}
                        className="py-[6px] px-5 hover:bg-black-300 rounded-[6px] text-[14px] md:text-[16px]"
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <DropDown
            divClassName="py-[17px] px-5 md:py-[19px] lg:py-[23px]"
            textClassName="text-gray"
            value={productCategory}
            onChange={(value) => setProductCategory(String(value))}
          >
            {categoryData?.map((cat) => (
              <DropDownOption
                value={cat.id}
                key={cat.id}
                onSelect={() => setProductCategory(cat.id)}
              >
                {cat.name}
              </DropDownOption>
            ))}
          </DropDown>
        </div>
      </div>
      <Textarea
        value={productDescript}
        placeholder="상품 설명을 작성해 주세요"
        onChange={(e) => setProductDescript(e.target.value)}
        onBlur={handleProductDescription}
        containerClassName="mb-5 md:mb-10"
        maxLength={500}
      />
      {productDescriptError && <span className="text-red">{productDescriptError}</span>}

      <Button disabled={!isFormValid} onClick={handleSubmit} className="w-full mb-5 md:mb-10">
        {selectedProduct ? '저장하기' : '추가하기'}
      </Button>
    </>
  );
};

export default ProductForm;
