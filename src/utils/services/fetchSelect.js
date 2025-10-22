import Api from '../axios/api';

export const fetchSelect = async ({ pageParam = 1, queryKey, url }) => {
  if (!queryKey || queryKey.length < 2) {
    throw new Error('Invalid query key');
  }

  if (typeof queryKey[0] !== 'string' || typeof queryKey[1] !== 'string') {
    throw new Error('Invalid query key format');
  }

  const search = queryKey[queryKey.length - 1] || '';
  const params = {
    page: search ? 1 : pageParam,
    'search[name,code]': search || '',
  };

  const response = await Api().get(url, { params });

  if (
    !response.data ||
    !response.data.results ||
    !Array.isArray(response.data.results)
  ) {
    console.error('Invalid response format:', response.data);
    throw new Error('Invalid response format');
  }

  return {
    data: response.data.results,
    nextPage: response?.data?.results?.links?.next
      ? Number(pageParam) + 1
      : undefined,
  };
};
