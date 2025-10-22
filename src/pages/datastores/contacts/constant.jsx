import { Button } from 'antd';
import { MoreVertical, Trash2 } from 'lucide-react';
import * as z from 'zod';

import ContextMenuOption from '@/blocs/ContextMenuOption';
import renderTags from '@/utils/renderTags';

// API Endpoints
export const ENDPOINTS = '/api/v1/contacts';

// Pagination defaults
export const DEFAULT_PER_PAGE = 10;
export const DEFAULT_PAGE = 1;
export const DEFAULT_FILTERS = {
  limit: DEFAULT_PER_PAGE,
  page: DEFAULT_PAGE,
};

export const ContactFormSchema = z
  .object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    position: z.string().min(1, 'Position is required'),
    contact_type: z.string().min(1, 'Contact type is required'),
    address: z.string().optional(),
  })
  .passthrough();

// Contact type colors mapping
export const TYPE_COLORS = {
  customer: 'blue',
  supplier: 'green',
  employee: 'orange',
  salesman: 'purple',
};

// Export CSV configuration
export const EXPORT_CSV_CONFIG = {
  selectedKeys: ['id', 'name', 'code', 'emails.0.value', 'phones.0.value'],
  defaultParams: {
    is_skip_pagination: true,
  },
};

// Mobile view expanded row render
export const expandedRowRender = (record) => (
  <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
    <p>code: {record.code}</p>
    <p>name: {record.name}</p>
    <p>email: {record.email}</p>
  </div>
);

// Table columns configuration
export const getColumns = () => [
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
    width: 100,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    responsive: ['md'],
    render: (email) => email ?? '-',
  },
  {
    title: 'Position',
    dataIndex: 'position',
    key: 'position',
    responsive: ['md'],
    render: (position) => position ?? '-',
  },
  {
    title: 'Type',
    dataIndex: 'contact_type',
    key: 'contact_type',
    width: 120,
    responsive: ['md'],
    render: (type) => {
      return renderTags(type, { tags: [type], color: TYPE_COLORS[type] });
    },
  },
  {
    title: 'Status',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
    justify: 'center',
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
        editPath={`/datastores/contacts/edit/${record.id}`}
        detailPath={`/datastores/contacts/detail/${record.id}`}
        deletePath={`/datastores/contacts/delete/${record.id}`}
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
    title: 'Contacts',
  },
];
