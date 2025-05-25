import { useQuery } from '@tanstack/react-query';
import { getCategoryList } from '@/api/category';
import { Category as CategoryType } from '@/types/category';
import CategorySkeleton from '@/components/home/CategorySkeleton';

const Category = ({
  selectedCategory,
  setSelectedCategory,
  setSelectedCategoryName,
  isMenuOpen,
  onClose,
}: {
  selectedCategory: number | null;
  setSelectedCategory: (id: number | null) => void;
  setSelectedCategoryName: (name: string | null) => void;
  isMenuOpen: boolean;
  onClose: () => void;

  // TODO interface로 뽑기
}) => {
  const {
    data: categoryList,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categoryList'],
    queryFn: getCategoryList,
  });

  if (isLoading) return <CategorySkeleton />;
  if (error) return <div>에러가 발생했습니다: {error.message}</div>;
  if (!categoryList) return <div>데이터가 없습니다.</div>;

  const handleCategoryClick = (category: CategoryType) => {
    if (category.id === selectedCategory) {
      setSelectedCategory(null);
      setSelectedCategoryName(null);
    } else {
      setSelectedCategory(category.id);
      setSelectedCategoryName(category.name);
    }
    onClose();
  };

  const baseClasses =
    'max-w-[220px] w-full px-[10px] md:px-0 w-[180px] lg:w-[170px] md:w-[180px] xl:w-[220px] ' +
    'bg-black-500 flex-shrink-0 ' +
    'transform transition-transform duration-300 ease-in-out';

  return (
    <div
      className={
        'fixed inset-y-0 left-0 md:static ' +
        baseClasses +
        ' ' +
        (isMenuOpen ? 'translate-x-0 md:translate-x-0' : '-translate-x-full md:translate-x-0')
      }
    >
      <h2 className="text-4 py-[15px] px-5 mt-[45px]">카테고리</h2>
      <ul>
        {categoryList.map((cat) => (
          <li
            key={cat.id}
            className={`text-4 py-[15px] px-5 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-black-400 text-gray-50 shadow-[inset_0_0_0_1px_rgba(53,53,66,1)] rounded-[8px]'
                : 'text-gray-200'
            }`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Category;
