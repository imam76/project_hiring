import { Card, Col, Row, Typography } from 'antd';
import {
  BarChart3,
  Calculator,
  CreditCard,
  DollarSign,
  FileBarChart,
  PieChart,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router';

const { Title } = Typography;

const Reports = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Financial Statement',
      icon: <FileBarChart size={24} />,
      path: '/reports/financial-statement',
      description: 'Balance sheet, income statement, and cash flow reports',
    },
    {
      title: 'Sales Reports',
      icon: <BarChart3 size={24} />,
      path: '/reports/sales',
      description: 'Sales performance and revenue analytics',
    },
    {
      title: 'Receivable Payment',
      icon: <CreditCard size={24} />,
      path: '/reports/receivable-payment',
      description: 'Customer payments and outstanding receivables',
    },
    {
      title: 'Purchase Reports',
      icon: <Receipt size={24} />,
      path: '/reports/purchase',
      description: 'Purchase orders and supplier transactions',
    },
    {
      title: 'Payable Reports',
      icon: <DollarSign size={24} />,
      path: '/reports/payable',
      description: 'Supplier payments and outstanding payables',
    },
  ];

  return (
    <div>
      <Title level={2}>Reports</Title>
      <Row gutter={[16, 16]}>
        {menuItems.map((item) => (
          <Col xs={24} sm={12} md={6} key={item.title}>
            <Card
              hoverable
              style={{
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'all 0.3s',
                minHeight: '180px',
              }}
              onClick={() => navigate(item.path)}
              className="hover:shadow-lg"
            >
              <div className="flex justify-center items-center p-4">
                {item.icon}
              </div>
              <Title level={4}>{item.title}</Title>
              <p className="text-gray-500 text-sm mt-2">{item.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Reports;
