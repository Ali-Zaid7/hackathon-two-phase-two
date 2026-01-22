import { useState, useCallback } from 'react';

interface ApiStatus {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const useApiStatus = () => {
  const [status, setStatus] = useState<ApiStatus>({
    loading: false,
    error: null,
    success: false,
  });

  const setLoading = useCallback(() => {
    setStatus({
      loading: true,
      error: null,
      success: false,
    });
  }, []);

  const setError = useCallback((errorMessage: string) => {
    setStatus({
      loading: false,
      error: errorMessage,
      success: false,
    });
  }, []);

  const setSuccess = useCallback(() => {
    setStatus({
      loading: false,
      error: null,
      success: true,
    });
  }, []);

  const resetStatus = useCallback(() => {
    setStatus({
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...status,
    setLoading,
    setError,
    setSuccess,
    resetStatus,
  };
};

export default useApiStatus;