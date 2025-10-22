import { StarFilled } from '@ant-design/icons';
import { Card, Collapse, List, Typography } from 'antd';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

const { Title } = Typography;

const data = [
  {
    title: 'Cash Flow',
    description: 'View cash inflows and outflows analysis',
    path: '/reports/financial-statement/cash-flow',
    isFavorite: false, // Add this property to control heart color
  },
  {
    title: 'Profit & Loss',
    description: 'Revenue, expenses, and profitability analysis',
    path: '/reports/financial-statement/filter-profit-loss',
    isFavorite: true, // This will show red heart
  },
  {
    title: 'Balance Sheet',
    description: 'Assets, liabilities, and equity overview',
    path: '/reports/financial-statement/balance-sheet',
    isFavorite: false,
  },
];

const FinancialStatement = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Title level={2}>Financial Statement</Title>
      <Card>
        <Collapse
          defaultActiveKey={['1']}
          expandIcon={({ isActive }) =>
            isActive ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
            )
          }
          items={[
            {
              key: '1',
              label: 'Financial Statement',
              children: (
                <List
                  itemLayout="horizontal"
                  dataSource={data}
                  size="small"
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <StarFilled
                          key="favorite"
                          onClick={() => alert('asdasd')}
                          style={{ color: item.isFavorite ? 'red' : 'gray' }}
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        onClick={() => navigate(item.path)}
                        title={
                          <div className="text-base font-semibold transition-all duration-100 hover:text-blue-500 cursor-pointer">
                            {item.title}
                          </div>
                        }
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default FinancialStatement;
