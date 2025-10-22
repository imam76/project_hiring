import { Breadcrumb, Card, Flex, Input, Space, Table, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Outlet } from 'react-router';

import ActionButtons from '@/components/ActionButton';
import TitleTableRender from '@/components/TitleTableRender';
import {
  DEFAULT_PER_PAGE,
  expandedRowRender,
  getBreadcrumbItems,
  getColumns,
} from './constant';
import { useContactsController } from './controller-contacts';

// Styles
const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

const { Title, Text } = Typography;
const { Search } = Input;

// Main Component
const ContentContacts = () => {
  const {
    selectedRow,
    screens,
    initialData,
    isLoading,
    currentPage,
    limit,
    searchValue,
    hasActiveFilters,
    isExporting,
    renderListMobileView,
    handleSearch,
    onShowSizeChange,
    handleSelectRow,
    onChange,
    handleRefresh,
    handleClearFilters,
    handleFilter,
    handleCreate,
    handleExportCSV,
    navigate,
  } = useContactsController();

  const { styles } = useStyle();
  const columns = getColumns();
  const breadcrumbItems = getBreadcrumbItems(navigate);

  const isMobile =
    (screens.xs || screens.sm) && (!screens.md || !screens.lg || !screens.xl);

  return (
    <Flex gap={'large'} vertical>
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Breadcrumb
          separator=">"
          style={{
            cursor: 'pointer',
          }}
          items={breadcrumbItems}
        />
        <Search
          size="large"
          placeholder="Search"
          color="primary"
          onChange={handleSearch}
          defaultValue={searchValue}
          style={{
            width: isMobile ? '100%' : 300,
          }}
          enterButton
        />
      </Flex>

      {isMobile ? (
        // Mobile view
        <>
          <Flex justify="space-between" align="center" wrap="wrap">
            <Text strong>Total {initialData?.results?.pagination?.total}</Text>
            <ActionButtons
              hasActiveFilters={hasActiveFilters}
              onRefresh={handleRefresh}
              onClearFilters={handleClearFilters}
              onFilter={handleFilter}
              onExportCSV={handleExportCSV}
              onCreate={handleCreate}
              isExporting={isExporting}
            />
          </Flex>
          {renderListMobileView()}
        </>
      ) : (
        // Desktop view
        <Card>
          <Space
            size={'small'}
            direction="vertical"
            style={{ display: 'flex' }}
          >
            <Flex justify="space-between" wrap="wrap">
              <Space size={'small'}>
                <Title level={2}>Contacts</Title>
                <Title level={3} type="secondary" strong>
                  {initialData?.results?.pagination?.total}
                </Title>
              </Space>

              <ActionButtons
                hasActiveFilters={hasActiveFilters}
                onRefresh={handleRefresh}
                onClearFilters={handleClearFilters}
                onFilter={handleFilter}
                onExportCSV={handleExportCSV}
                onCreate={handleCreate}
                isExporting={isExporting}
              />
            </Flex>

            <Table
              size="middle"
              loading={isLoading}
              className={`${styles.customTable} striped-table`}
              dataSource={initialData?.results?.list ?? []}
              rowKey={'id'}
              rowSelection={{
                preserveSelectedRowKeys: true,
                type: 'checkbox',
                onChange: handleSelectRow,
                checkStrictly: true,
              }}
              columns={columns}
              title={() =>
                TitleTableRender({
                  selectedLength: selectedRow.length,
                })
              }
              pagination={{
                responsive: true,
                current: currentPage,
                onChange: onChange,
                showSizeChanger: true,
                onShowSizeChange: onShowSizeChange,
                defaultPageSize: DEFAULT_PER_PAGE,
                pageSize: limit,
                total: initialData?.results?.pagination?.total ?? 0,
                position: ['bottomLeft'],
                size: 'default',
              }}
              expandable={{
                expandedRowRender,
                rowExpandable: (_) => true,
              }}
            />
          </Space>
        </Card>
      )}
      <Outlet />
    </Flex>
  );
};

export default ContentContacts;
