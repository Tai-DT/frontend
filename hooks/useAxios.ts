// hooks/useAxios.ts
import { useState, useEffect } from 'react';
import axios, { AxiosPromise } from 'axios';

export function useAxios<T>(axiosCall: () => AxiosPromise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null );

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchData = async () => {
      try {
        const response = await axiosCall();
        setData(response.data);
        setLoading(false);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      source.cancel('Component unmounted');
    };
  }, [axiosCall]);

  return { data, loading, error };
}