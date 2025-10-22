import { Card, Col, Row, Typography } from 'antd';
import {
  Building2,
  FileText,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  User,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router';

const { Title } = Typography;

const Datastore = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Contacts',
      icon: <User size={24} />,
      path: '/datastores/contacts/list',
    },
    {
      title: 'Products',
      icon: <ShoppingCart size={24} />,
      path: '/datastores/products/list',
    },
    {
      title: 'Companies',
      icon: <Building2 size={24} />,
      path: '/datastores/companies/list',
    },
    {
      title: 'Suppliers',
      icon: <Users size={24} />,
      path: '/datastores/suppliers/list',
    },
    {
      title: 'Categories',
      icon: <Tags size={24} />,
      path: '/datastores/categories/list',
    },
    {
      title: 'Inventory',
      icon: <Package size={24} />,
      path: '/datastores/inventory/list',
    },
    {
      title: 'Documents',
      icon: <FileText size={24} />,
      path: '/datastores/documents/list',
    },
    {
      title: 'Settings',
      icon: <Settings size={24} />,
      path: '/datastores/settings/list',
    },
  ];

  return (
    <div>
      <Title level={2}>Datastore</Title>
      <Row gutter={[16, 16]}>
        {menuItems.map((item) => (
          <Col xs={24} sm={12} md={6} key={item.title}>
            <Card
              hoverable
              style={{
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'all 0.3s',
              }}
              onClick={() => navigate(item.path)}
              className="hover:shadow-lg"
            >
              <div className="flex justify-center items-center p-4">
                {item.icon}
              </div>
              <Title level={4}>{item.title}</Title>
              <p className="text-gray-500 text-sm mt-2">
                Manage your {item.title.toLowerCase()} information
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Datastore;
