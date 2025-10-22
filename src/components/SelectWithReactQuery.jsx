import { useInfiniteQuery } from '@tanstack/react-query';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { useState } from 'react';

const { Option } = Select;

export default function SelectWithReactQuery({
  // Query Configuration
  url = '/api/v1/contacts', // Default URL, can be overridden
  queryKey,
  customFetcher, // Required: your axios service function
  debounceMs = 300,
  enabled = true,

  // Data Mapping
  labelKey = 'name',
  valueKey = 'id',

  // Select Props
  placeholder = 'Pilih item',
  style = { width: '100%' },
  mode,
  allowClear = true,
  showSearch = true,

  // Event Handlers
  onChange,
  onSelect,
  onDeselect,

  // UI Customization
  loadingText = 'Loading more...',
  notFoundText = 'Data not found',

  ...selectProps
}) {
  const [search, setSearch] = useState('');

  // Require customFetcher since we're using axios
  if (!customFetcher) {
    throw new Error(
      'customFetcher is required. Please provide your axios service function.',
    );
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: [...(queryKey || 'select-data'), search],
    queryFn: ({ pageParam = 1, queryKey }) =>
      customFetcher({ pageParam, queryKey, url: url }),
    getNextPageParam: (lastPage) => {
      // Check if the last page has a nextPage property
      if (!lastPage || !lastPage.nextPage) {
        return undefined; // No more pages to fetch
      }
      return lastPage.nextPage;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleSearch = debounce((value) => {
    setSearch(value);
    refetch();
  }, debounceMs);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (
      scrollTop + clientHeight >= scrollHeight - 5 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  const options =
    data?.pages.flatMap((page) =>
      page.data.map((item) => ({
        label: item[labelKey],
        value: item[valueKey],
        data: item, // Keep original data for reference
      })),
    ) || [];

  // Handle loading state
  const getNotFoundContent = () => {
    if (isFetching) return <Spin size="small" />;
    if (error) return `Error: ${error.message}`;
    return notFoundText;
  };

  return (
    <Select
      loading={isFetching}
      showSearch={showSearch}
      labelInValue
      filterOption={false}
      onSearch={handleSearch}
      onPopupScroll={handleScroll}
      notFoundContent={getNotFoundContent()}
      placeholder={placeholder}
      style={style}
      mode={mode}
      allowClear={allowClear}
      onClear={() => {
        setSearch('');
        refetch();
      }}
      onChange={onChange}
      onSelect={onSelect}
      onDeselect={onDeselect}
      {...selectProps}
    >
      {options.map((option) => (
        <Option
          key={option.value}
          title={option.label}
          value={option.value}
          data-item={option.data}
        >
          {option.label}
        </Option>
      ))}
      {isFetchingNextPage && (
        <Option disabled key="loading">
          <Spin size="small" /> {loadingText}
        </Option>
      )}
    </Select>
  );
}
