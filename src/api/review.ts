import axiosInstance from './axiosInstance';
import { CreateReviewRequest, ReviewResponse, UpdateReviewRequest } from '@/types/review';

export const createReview = async (body: CreateReviewRequest) => {
  try {
    const response = await axiosInstance.post<ReviewResponse>('/reviews', body);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteReview = async (reviewId: number) => {
  try {
    await axiosInstance.delete(`/reviews/${reviewId}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateReview = async (reviewId: number, body: UpdateReviewRequest) => {
  try {
    const response = await axiosInstance.patch<ReviewResponse>(`/reviews/${reviewId}`, body);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
