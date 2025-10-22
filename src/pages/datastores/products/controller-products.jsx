import { Avatar, Grid, List } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';

import ListInfiniteScroll from '@/components/ListInfinteScroll';
import { useDataQuery } from '@/utils/hooks/useDataQuery';
import { useDebouncedSearchParams } from '@/utils/hooks/useDebouncedSearchParams';
import useExportCSV from '@/utils/hooks/useExportCSV';
import {
  DEFAULT_FILTERS,
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  ENDPOINTS,
  EXPORT_CSV_CONFIG,
} from './constant';

const { useBreakpoint } = Grid;

export const useProductsController = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const fetcher = useFetcher({ key: 'action-delete' });
  const [selectedRow, setSelectedRow] = useState([]);

  const { searchParam, updateParam, clearAllParams } =
    useDebouncedSearchParams(600);

  // Parse URL parameters
  const allParams = Object.fromEntries(searchParam.entries());
  const currentPage = Number.parseInt(allParams.page, 10) || DEFAULT_PAGE;
  const limit = Number.parseInt(allParams.limit, 10) || DEFAULT_PER_PAGE;
  const searchValue = allParams.search || '';

  const currentFilters = {
    ...DEFAULT_FILTERS,
    ...allParams,
  };

  const hasActiveFilters = Object.keys(allParams).length > 0;

  // Export CSV hook
  const { exportToCSV, isExporting } = useExportCSV({
    endpoint: ENDPOINTS,
    selectedKeys: EXPORT_CSV_CONFIG.selectedKeys,
    filename: `products_${moment().format('YYYY-MM-DD')}`,
    defaultParams: EXPORT_CSV_CONFIG.defaultParams,
  });

  // Data fetching
  const { initialData, isLoading, refetch } = useDataQuery({
    queryKey: ['products'],
    getUrl: ENDPOINTS,
    filters: currentFilters,
  });

  // Effect to refetch data after delete operation
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      refetch();
    }
  }, [refetch, fetcher.state, fetcher.data]);

  // Event handlers
  const handleSearch = (e) => {
    updateParam({ search: e.target.value, page: 1 });
  };

  const onShowSizeChange = (_, newPerPage) => {
    updateParam({ limit: newPerPage, page: 1 });
  };

  const handleSelectRow = (selectedRowKeys, selectedRows) => {
    console.info('selectedRowKeys =>', selectedRowKeys);
    console.info('selectedRows =>', selectedRows);
    setSelectedRow(selectedRowKeys);
  };

  const onChange = (page) => {
    updateParam('page', page);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleClearFilters = () => {
    clearAllParams?.();
  };

  const handleFilter = () => {
    navigate('filter');
  };

  const handleCreate = () => {
    navigate('/datastores/products/create');
  };

  const handleExportCSV = () => {
    exportToCSV();
  };

  // Navigation functions
  const navigateToDatastores = () => {
    navigate('/datastores');
  };

  return {
    // State
    selectedRow,
    screens,

    // Data
    initialData,
    isLoading,
    currentPage,
    limit,
    searchValue,
    hasActiveFilters,
    isExporting,

    // Event handlers
    handleSearch,
    onShowSizeChange,
    handleSelectRow,
    onChange,
    handleRefresh,
    handleClearFilters,
    handleFilter,
    handleCreate,
    handleExportCSV,
    navigateToDatastores,
    renderListMobileView: () => (
      <ListInfiniteScroll
        queryKey="mobile-products"
        endpoint={ENDPOINTS}
        pageSize={limit}
        filters={currentFilters}
        onEdit={(item) => navigate(`/datastores/contacts/edit/${item.id}`)}
        onDetail={(item) => navigate(`/datastores/contacts/detail/${item.id}`)}
        onDelete={(item) => navigate(`/datastores/contacts/delete/${item.id}`)}
        renderItem={(item, handleItemClick) => (
          <List.Item key={item.id} onClick={() => handleItemClick(item)}>
            <List.Item.Meta
              avatar={
                item.avatar ? (
                  <Avatar src={item.avatar} />
                ) : (
                  <Avatar>{item.name?.[0] || item.title?.[0] || '?'}</Avatar>
                )
              }
              title={item.name}
              description={item.code || 'No Description'}
            />
          </List.Item>
        )}
      />
    ),

    // Navigation
    navigate,
  };
};
