import { Button, Grid, Space } from 'antd';
import { Plus, RefreshCcw } from 'lucide-react';
import { LucideDownload } from 'lucide-react';
import FilterButton from './FilterButton';

const { useBreakpoint } = Grid;

const ActionButtons = ({
  hasActiveFilters,
  onRefresh,
  onClearFilters,
  onFilter,
  onExportCSV,
  onCreate,
  isExporting,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Space size={'small'}>
      <Button
        variant="outlined"
        color="primary"
        shape="default"
        icon={<RefreshCcw size={12} />}
        size={'middle'}
        onClick={onRefresh}
        title={isMobile ? 'Refresh' : undefined}
      />
      <FilterButton
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onFilter={onFilter}
        isMobile={isMobile}
      />
      <Button
        variant="outlined"
        color="primary"
        onClick={onExportCSV}
        loading={isExporting}
        icon={<LucideDownload size={16} />}
        title={isMobile ? 'Export to CSV' : undefined}
      >
        {!isMobile && 'Export to CSV'}
      </Button>
      <Button
        variant="solid"
        color="primary"
        onClick={onCreate}
        icon={isMobile ? <Plus size={16} /> : undefined}
        title={isMobile ? 'Create' : undefined}
      >
        {!isMobile && 'Create'}
      </Button>
    </Space>
  );
};

export default ActionButtons;
