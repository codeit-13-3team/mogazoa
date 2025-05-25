import { useEffect, useRef, useState } from 'react';
import { imageUpload } from '@/api/image';
import Image from 'next/image';
import ImageIcon from '../../public/icon/common/photo.png';
import deleteIcon from '../../public/icon/common/close.png';

type ImageUploaderProps = {
  isSingleImage?: boolean;
  image?: string;
  images?: string[];
  onUploadImage?: (url: string) => void;
  onUploadImages?: (urls: string[]) => void;
  onRemoveImage?: () => void;
  onRemoveImages?: (index: number) => void;
  maxImages?: number;
  errorMessage?: string;
};

function ImageUploader({
  isSingleImage = true,
  image = '',
  images = [],
  onUploadImage,
  onUploadImages,
  onRemoveImage,
  onRemoveImages,
  maxImages = 3,
  errorMessage,
}: ImageUploaderProps) {
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [prevUrls, setPrevUrls] = useState<string[]>([]);

  useEffect(() => {
    if (isSingleImage) {
      setPrevUrl(image);
    } else {
      setPrevUrls(images);
    }
  }, [image, images, isSingleImage]);

  useEffect(() => {
    return () => {
      if (prevUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(prevUrl);
      }
      prevUrls.forEach((url) => {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [prevUrl, prevUrls]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      alert('파일 크기가 5MB를 초과했습니다.');
      return false;
    }
    return true;
  };

  const getValidateFile = (e: React.ChangeEvent<HTMLInputElement>): File | null => {
    const files = e.target.files;
    if (!files || files.length === 0) return null;

    const file = files[0];
    if (!validateFileSize(file)) {
      e.target.value = '';
      return null;
    }

    return file;
  };

  const imageFileChange = async (file: File): Promise<string | null> => {
    try {
      const response = await imageUpload(file);
      return response.url;
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
      return null;
    }
  };

  const singleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = getValidateFile(e);
    if (!file) return;

    if (prevUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPrevUrl(objectUrl);

    const uploadedUrl = await imageFileChange(file);

    if (uploadedUrl) {
      setPrevUrl(uploadedUrl);
      onUploadImage?.(uploadedUrl);
      URL.revokeObjectURL(objectUrl);
    }

    e.target.value = '';
  };

  const addImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = getValidateFile(e);
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const newPreviews = [...prevUrls, objectUrl];
    setPrevUrls(newPreviews);

    const uploadedUrl = await imageFileChange(file);
    if (uploadedUrl && onUploadImages && images.length < maxImages) {
      const updatedImages = [...images, uploadedUrl];
      onUploadImages(updatedImages);

      const updatedPreviews = [...prevUrls, uploadedUrl];
      setPrevUrls(updatedPreviews);
      URL.revokeObjectURL(objectUrl);
    } else {
      setPrevUrls(prevUrls);
      URL.revokeObjectURL(objectUrl);
    }

    e.target.value = '';
  };

  const replaceImagesChange = (index: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = getValidateFile(e);
    if (!file) return;

    const currentUrl = prevUrls[index];
    if (currentUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(currentUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    const updatedPreviews = [...prevUrls];
    updatedPreviews[index] = objectUrl;
    setPrevUrls(updatedPreviews);

    const uploadedUrl = await imageFileChange(file);
    if (uploadedUrl && onUploadImages) {
      const updatedImages = [...images];
      updatedImages[index] = uploadedUrl;
      onUploadImages(updatedImages);

      const updatedUrls = [...prevUrls];
      updatedUrls[index] = uploadedUrl;
      setPrevUrls(updatedUrls);
      URL.revokeObjectURL(objectUrl);
    } else {
      setPrevUrls(prevUrls);
      URL.revokeObjectURL(objectUrl);
    }

    e.target.value = '';
  };

  const imageFileClick = () => {
    addInputRef.current?.click();
  };

  const replaceFileClick = (index: number) => {
    replaceInputRefs.current[index]?.click();
  };

  const removeImageFile = (index?: number) => {
    if (isSingleImage) {
      if (prevUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(prevUrl);
      }
      setPrevUrl(null);
      onRemoveImage?.();
    } else if (typeof index === 'number') {
      const targetUrl = prevUrls[index];
      if (targetUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(targetUrl);
      }
      const updatedPreviews = [...prevUrls];
      updatedPreviews.splice(index, 1);
      setPrevUrls(updatedPreviews);
      onRemoveImages?.(index);
    }
  };

  if (isSingleImage) {
    return (
      <div className="relative rounded-[8px] border border-black-300 bg-black-400 w-[140px] h-[140px] md:w-[135px] md:h-[135px] lg:w-[160px] lg:h-[160px]">
        <div
          className="flex justify-center items-center relative w-full h-full cursor-pointer"
          onClick={imageFileClick}
        >
          <input
            type="file"
            accept="image/*"
            ref={addInputRef}
            onChange={singleImageChange}
            className="hidden"
          />
          {prevUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={prevUrl}
                alt="업로드한 이미지"
                fill
                className="rounded-[8px] object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImageFile();
                }}
                className="flex justify-center items-center absolute top-1 right-1 rounded-[8px] p-1 bg-[#000000]/50 w-[26px] h-[26px] lg:w-[28px] lg:h-[28px] z-50"
              >
                <Image src={deleteIcon} alt="이미지 제거" width={18} height={18} />
              </button>
            </div>
          ) : (
            <Image
              src={ImageIcon}
              alt="이미지 추가 아이콘"
              className="w-6 h-6 md:w-[25px] md:h-[25px] lg:w-[34px] lg:h-[34px]"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-nowrap overflow-x-auto gap-[10px] md:gap-[15px] lg:gap-5">
      {images.length < maxImages && (
        <div
          className="flex justify-center items-center relative rounded-[8px] border border-black-300 bg-black-400 w-[140px] h-[140px] md:w-[135px] md:h-[135px] lg:w-[160px] lg:h-[160px] shrink-0 cursor-pointer"
          onClick={imageFileClick}
        >
          <input
            type="file"
            accept="image/*"
            ref={addInputRef}
            onChange={addImagesChange}
            className="hidden"
          />
          <Image
            src={ImageIcon}
            alt="이미지 추가 아이콘"
            className="w-6 h-6 md:w-[25px] md:h-[25px] lg:w-[34px] lg:h-[34px]"
          />
        </div>
      )}

      {prevUrls.map((imgUrl, index) => (
        <div
          key={index}
          className="relative rounded-[8px] border border-black-300 bg-black-400 w-[140px] h-[140px] md:w-[135px] md:h-[135px] lg:w-[160px] lg:h-[160px] shrink-0"
        >
          <Image
            src={imgUrl}
            alt={`업로드한 이미지 ${index + 1}`}
            fill
            className="rounded-[8px] object-cover cursor-pointer"
            onClick={() => replaceFileClick(index)}
          />
          <input
            type="file"
            accept="image/*"
            ref={(el) => {
              replaceInputRefs.current[index] = el;
            }}
            onChange={replaceImagesChange(index)}
            className="hidden"
          />
          <button
            className="flex justify-center items-center absolute top-1 right-1 rounded-[8px] p-1 bg-[#000000]/50 w-[26px] h-[26px] lg:w-[28px] lg:h-[28px] z-50"
            onClick={() => removeImageFile(index)}
          >
            <Image src={deleteIcon} alt="이미지 제거" width={18} height={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ImageUploader;
