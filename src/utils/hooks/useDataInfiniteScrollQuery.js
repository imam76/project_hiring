import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import Api from '../axios/api';
import { showErrorNotification } from '../globalNotification';

/**
 * Builds a URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Query parameters object
 * @returns {string} URL with query parameters
 */
function buildUrl(baseUrl, params) {
  const queryParts = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    // Custom format: key with brackets and CSV (e.g. includes[emails,phones]=true)
    const isBracketCsvKey =
      key.includes('[') && key.includes(',') && key.includes(']');

    if (isBracketCsvKey) {
      // Jangan encode key-nya
      queryParts.push(`${key}=${encodeURIComponent(value)}`);
    } else if (key === 'includes' && Array.isArray(value)) {
      // Khusus: includes[emails,phones,...]=true
      const joined = value.join(',');
      queryParts.push(`includes[${joined}]=true`);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Nested object: search[name]=abc
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (nestedValue !== undefined && nestedValue !== null) {
          queryParts.push(
            `${encodeURIComponent(key)}[${encodeURIComponent(nestedKey)}]=${encodeURIComponent(nestedValue)}`,
          );
        }
      }
    } else {
      // Normal key=value
      queryParts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      );
    }
  }

  const queryString = queryParts.join('&');
  return `${baseUrl}?${queryString}`;
}

/**
 * Custom hook for handling infinite scroll data loading with React Query
 * @param {Object} config - Configuration object
 * @param {string[]} config.queryKey - Unique key for caching
 * @param {string} config.getUrl - Endpoint for fetching data (GET)
 * @param {Object} [config.filters={}] - Filter parameters for GET request
 * @param {string} [config.submitUrl] - Endpoint for submitting data
 * @param {string} [config.method='POST'] - HTTP method for submission
 * @param {boolean} [config.enabled=true] - Whether to enable the data fetching
 * @param {number} [config.pageSize=10] - Number of items per page
 * @param {string} [config.pageParam='page'] - Parameter name for page number
 * @param {string} [config.limitParam='limit'] - Parameter name for page size
 * @param {Function} [config.onSuccess] - Callback when submission succeeds
 * @param {Function} [config.onError] - Callback when submission fails
 * @param {Function} [config.transformResponse] - Function to transform API response
 * @param {Function} [config.getNextPageParam] - Function to get next page parameter
 * @param {Object} [config.queryOptions={}] - Additional options for useInfiniteQuery
 * @param {Object} [config.mutationOptions={}] - Additional options for useMutation
 * @param {Object} [config.axiosConfig={}] - Additional Api configuration
 * @returns {Object} Infinite scroll query result object
 */
export function useDataInfiniteScrollQuery({
  queryKey,
  getUrl,
  filters = {},
  submitUrl,
  method = 'POST',
  enabled = true,
  pageSize = 10,
  pageParam = 'page',
  limitParam = 'limit',
  onSuccess,
  onError,
  transformResponse = (data) => data,
  getNextPageParam = (lastPage, allPages) => {
    // Handle response with results.pagination structure
    if (lastPage?.results?.pagination) {
      const pagination = lastPage.results.pagination;
      return pagination.has_next ? pagination.page + 1 : undefined;
    }

    // Handle response with direct pagination structure
    if (lastPage?.pagination) {
      const pagination = lastPage.pagination;
      return pagination.has_next || pagination.hasNext
        ? pagination.page + 1
        : undefined;
    }

    // Handle array response (fallback)
    if (Array.isArray(lastPage) && lastPage.length === pageSize) {
      return allPages.length + 1;
    }

    // Handle response with data array
    if (
      lastPage?.data &&
      Array.isArray(lastPage.data) &&
      lastPage.data.length === pageSize
    ) {
      return allPages.length + 1;
    }

    // Handle response with results.list array
    if (
      lastPage?.results?.list &&
      Array.isArray(lastPage.results.list) &&
      lastPage.results.list.length === pageSize
    ) {
      return allPages.length + 1;
    }

    return undefined;
  },
  queryOptions = {},
  mutationOptions = {},
  axiosConfig = {},
}) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const effectiveQueryKey = [...queryKey];
  if (Object.keys(filters).length > 0) {
    effectiveQueryKey.push({ filters });
  }

  // Infinite query for paginated data
  const {
    data,
    isLoading,
    error: fetchError,
    refetch,
    isError: isFetchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: effectiveQueryKey,
    queryFn: async ({ pageParam: currentPage = 1 }) => {
      try {
        const params = {
          ...filters,
          [pageParam]: currentPage,
          [limitParam]: pageSize,
        };

        const fullGetUrl = buildUrl(getUrl, params);

        const res = await Api().get(fullGetUrl, {
          ...axiosConfig,
          paramsSerializer: {
            // Handle complex parameter serialization (like arrays and nested objects)
            encode: (param) => {
              // We already handled this in buildUrl
              return param;
            },
          },
        });

        return transformResponse(res.data);
      } catch (error) {
        console.error('Error fetching data:', error);

        // Show error notification
        showErrorNotification({
          message: 'Failed to load data',
          description: error?.response?.data?.message || error.message,
        });

        throw error;
      }
    },
    getNextPageParam,
    enabled: enabled && Boolean(getUrl),
    ...queryOptions,
  });

  // Flatten all pages data into a single array
  const flatData = useMemo(() => {
    if (!data?.pages) return [];

    return data.pages.reduce((acc, page) => {
      // Handle response with results.list structure
      if (page?.results?.list && Array.isArray(page.results.list)) {
        return acc.concat(page.results.list);
      }

      // Handle response with data array
      if (page?.data && Array.isArray(page.data)) {
        return acc.concat(page.data);
      }

      // Handle direct array response
      if (Array.isArray(page)) {
        return acc.concat(page);
      }

      // Handle single object response
      if (page && typeof page === 'object') {
        return acc.concat([page]);
      }

      return acc;
    }, []);
  }, [data?.pages]);

  // Form submission mutation (optional)
  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (!submitUrl) {
        throw new Error('submitUrl is required for mutation');
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const res = await Api().request({
          url: submitUrl,
          method,
          data: formData,
          ...axiosConfig,
        });
        return transformResponse(res.data);
      } catch (error) {
        setSubmitError(error);

        // Show error notification
        showErrorNotification({
          message: 'Submission Failed',
          description: error?.response?.data?.message || error.message,
        });

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data) => {
      // Refresh data if needed
      queryClient.invalidateQueries({ queryKey: effectiveQueryKey });

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (err) => {
      if (onError) {
        onError(err);
      }
    },
    ...mutationOptions,
  });

  // Enhanced submit function with better error handling
  const submit = useCallback(
    (formData) => {
      return mutation.mutate(formData);
    },
    [mutation],
  );

  const clearErrors = useCallback(() => {
    setSubmitError(null);
  }, []);

  const reset = useCallback(() => {
    clearErrors();
    refetch();
  }, [clearErrors, refetch]);

  // Load more function for easier usage
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Check if we can load more
  const canLoadMore = Boolean(hasNextPage && !isFetchingNextPage && !isLoading);

  return {
    // Data
    data: flatData,
    pages: data?.pages || [],
    pageParams: data?.pageParams || [],

    // Loading states
    isLoading,
    isFetchingNextPage,
    isRefetching,

    // Error states
    fetchError,
    submitError,
    error: submitError || fetchError,
    isFetchError,
    hasError: Boolean(submitError || fetchError),

    // Pagination
    hasNextPage,
    canLoadMore,
    loadMore,
    fetchNextPage,

    // Form submission (if submitUrl provided)
    isSubmitting,
    isSuccess: mutation.isSuccess,
    submit: submitUrl ? submit : undefined,

    // Utility functions
    clearErrors,
    refetch,
    reset,

    // Raw objects for advanced usage
    mutation: submitUrl ? mutation : undefined,
    infiniteQuery: {
      data,
      isLoading,
      error: fetchError,
      refetch,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    },

    // Config
    filters,
    pageSize,
  };
}
