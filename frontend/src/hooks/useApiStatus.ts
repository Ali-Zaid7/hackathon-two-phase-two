import { useState, useCallback } from 'react';
import { useToast } from '@/components/ToastProvider';

export interface ApiStatus {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useApiStatus = () => {
  const [status, setStatus] = useState<ApiStatus>({
    loading: false,
    error: null,
    success: false,
  });

  const { showToast } = useToast();

  const executeWithStatus = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    setStatus({ loading: true, error: null, success: false });

    try {
      const result = await apiCall();

      setStatus({ loading: false, error: null, success: true });

      if (successMessage) {
        showToast(successMessage, 'success');
      }

      return result;
    } catch (error: any) {
      const errorMsg = errorMessage || (error.message || 'An error occurred');
      setStatus({ loading: false, error: errorMsg, success: false });

      showToast(errorMsg, 'error');

      console.error('API Error:', error);
      return null;
    }
  }, [showToast]);

  const resetStatus = useCallback(() => {
    setStatus({ loading: false, error: null, success: false });
  }, []);

  return {
    status,
    executeWithStatus,
    resetStatus,
  };
};
