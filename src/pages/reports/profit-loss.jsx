import { ProTable } from '@ant-design/pro-components';
import {
  Breadcrumb,
  Button,
  Card,
  DatePicker,
  Flex,
  Select,
  Space,
  Typography,
} from 'antd';
import { Download, Filter, Printer } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ProfitLoss = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(null);
  const [period, setPeriod] = useState('monthly');

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount) =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(amount),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  const data = [
    {
      key: '1',
      description: 'Revenue from Sales',
      amount: 150000000,
      category: 'Revenue',
      date: '2024-01-01',
    },
    {
      key: '2',
      description: 'Cost of Goods Sold',
      amount: -80000000,
      category: 'Cost',
      date: '2024-01-01',
    },
    {
      key: '3',
      description: 'Operating Expenses',
      amount: -30000000,
      category: 'Expense',
      date: '2024-01-01',
    },
  ];

  return (
    <div>
      <Flex vertical gap="large">
        <Breadcrumb
          separator=">"
          items={[
            {
              title: 'Reports',
              onClick: () => navigate('/reports'),
            },
            {
              title: 'Profit & Loss',
            },
          ]}
        />

        <Card>
          <Flex vertical gap="middle">
            <Flex justify="space-between" align="center">
              <Title level={3}>Profit & Loss Statement</Title>
              <Space>
                <Button icon={<Printer size={16} />}>Print</Button>
                <Button icon={<Download size={16} />}>Export</Button>
              </Space>
            </Flex>

            <Flex gap="middle" align="center">
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                style={{ width: 280 }}
              />
              <Select
                value={period}
                onChange={(value) => setPeriod(value)}
                style={{ width: 120 }}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' },
                ]}
              />
              <Button icon={<Filter size={16} />}>More Filters</Button>
            </Flex>

            <ProTable
              columns={columns}
              dataSource={data}
              pagination={false}
              search={false}
              dateFormatter="string"
              toolbar={{
                settings: [],
              }}
              summary={(pageData) => {
                let totalAmount = 0;
                for (const { amount } of pageData) {
                  totalAmount += amount;
                }

                return (
                  <>
                    <ProTable.Summary.Row>
                      <ProTable.Summary.Cell index={0}>
                        <strong>Net Profit/Loss</strong>
                      </ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={1}>
                        <strong>
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          }).format(totalAmount)}
                        </strong>
                      </ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={2} />
                      <ProTable.Summary.Cell index={3} />
                    </ProTable.Summary.Row>
                  </>
                );
              }}
            />
          </Flex>
        </Card>
      </Flex>
    </div>
  );
};

export default ProfitLoss;
