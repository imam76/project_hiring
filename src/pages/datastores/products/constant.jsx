import { Button } from 'antd';
import { MoreVertical } from 'lucide-react';
import * as z from 'zod';

import ContextMenuOption from '@/blocs/ContextMenuOption';
import renderTags from '@/utils/renderTags';

// API Endpoints
export const ENDPOINTS = '/api/v1/products';

// Pagination defaults
export const DEFAULT_PER_PAGE = 10;
export const DEFAULT_PAGE = 1;
export const DEFAULT_FILTERS = {
  limit: DEFAULT_PER_PAGE,
  page: DEFAULT_PAGE,
};

// Product form schema
export const ProductFormSchema = z
  .object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    base_unit: z.string().min(1, 'Base unit is required'),
    sku: z.string().min(1, 'SKU is required'),
    description: z.string().min(1, 'Description is required'),
    selling_price: z.number().min(0, 'Selling price must be positive'),
    unit_cost: z.number().min(0, 'Unit cost must be positive'),
  })
  .passthrough();

// Export CSV configuration
export const EXPORT_CSV_CONFIG = {
  selectedKeys: [
    'id',
    'name',
    'code',
    'base_unit',
    'unit_cost',
    'selling_price',
  ],
  defaultParams: {
    is_skip_pagination: true,
  },
};

// Mobile view expanded row render
export const expandedRowRender = (record) => (
  <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
    <p>code: {record.code}</p>
    <p>name: {record.name}</p>
    <p>selling price: {record.selling_price}</p>
  </div>
);

// Table columns configuration
export const getColumns = () => [
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
    width: 100,
    responsive: ['md'],
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: 'Base Unit',
    dataIndex: 'base_unit',
    key: 'base_unit',
    responsive: ['md'],
    render: (base_unit) => base_unit ?? '-',
  },
  {
    title: 'Unit Cost',
    dataIndex: 'unit_cost',
    key: 'unit_cost',
    responsive: ['md'],
    render: (unit_cost) => unit_cost ?? '-',
  },
  {
    title: 'Selling Price',
    dataIndex: 'selling_price',
    key: 'selling_price',
    responsive: ['md'],
    render: (selling_price) => selling_price ?? '-',
  },
  {
    title: 'Status',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
    justify: 'center',
    responsive: ['md'],
    render: (_, record) => {
      const status = record.is_active ? 'active' : 'inactive';
      return renderTags(_, { tags: [status] });
    },
  },
  {
    title: '',
    dataIndex: '',
    key: 'x',
    align: 'right',
    width: 50,
    render: (_, record) => (
      <ContextMenuOption
        editPath={`/datastores/products/edit/${record.id}`}
        detailPath={`/datastores/products/detail/${record.id}`}
        deletePath={`/datastores/products/delete/${record.id}`}
      >
        <Button
          variant="text"
          type="text"
          shape="circle"
          icon={<MoreVertical size={12} />}
          size={'middle'}
        />
      </ContextMenuOption>
    ),
  },
];

// Breadcrumb items
export const getBreadcrumbItems = (navigate) => [
  {
    title: 'Datastore',
    onClick: () => navigate('/datastores'),
  },
  {
    title: 'Products',
  },
];
