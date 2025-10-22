import { Button } from 'antd';
import { ListFilterIcon } from 'lucide-react';
import { Trash2 } from 'lucide-react';

const FilterButton = ({ hasActiveFilters, onClearFilters, onFilter }) => {
  if (hasActiveFilters) {
    return (
      <Button
        variant="outlined"
        color="primary"
        shape="default"
        icon={<Trash2 size={12} />}
        size={'middle'}
        onClick={onClearFilters}
      >
        Clear Filter
      </Button>
    );
  }
  return (
    <Button
      variant="outlined"
      color="primary"
      shape="default"
      icon={<ListFilterIcon size={12} />}
      size={'middle'}
      onClick={onFilter}
    />
  );
};

export default FilterButton;
