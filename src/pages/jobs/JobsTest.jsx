import { useAuthStore } from '@/stores/authStore';
import { Card, Descriptions, Tag, Typography } from 'antd';

const { Title, Text } = Typography;

/**
 * Component untuk testing role-based access
 * Menampilkan informasi user dan role untuk debugging
 */
const JobsTest = () => {
  const { user } = useAuthStore();

  const isAdminOrCompany =
    user?.role === 'admin' ||
    user?.role === 'company' ||
    user?.is_admin === true;

  return (
    <Card title="Job Module - Role Testing" style={{ margin: '24px' }}>
      <Title level={4}>Current User Information</Title>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="User ID">
          {user?.id || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Username">
          {user?.username || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {user?.email || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Role">
          <Tag color={isAdminOrCompany ? 'green' : 'blue'}>
            {user?.role || 'N/A'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Is Admin">
          {user?.is_admin ? 'Yes' : 'No'}
        </Descriptions.Item>
        <Descriptions.Item label="Access Level">
          <Tag color={isAdminOrCompany ? 'success' : 'warning'}>
            {isAdminOrCompany
              ? 'Admin/Company - Full Access'
              : 'User - Read Only'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: '24px' }}>
        <Title level={4}>Available Actions</Title>
        <Text strong>Based on current role, user can:</Text>
        <ul>
          {isAdminOrCompany ? (
            <>
              <li>
                <Text type="success">✓ Create new jobs</Text>
              </li>
              <li>
                <Text type="success">✓ Edit existing jobs</Text>
              </li>
              <li>
                <Text type="success">✓ Delete jobs</Text>
              </li>
              <li>
                <Text type="success">✓ View all job details</Text>
              </li>
            </>
          ) : (
            <>
              <li>
                <Text type="warning">✗ Create new jobs (Admin only)</Text>
              </li>
              <li>
                <Text type="warning">✗ Edit existing jobs (Admin only)</Text>
              </li>
              <li>
                <Text type="warning">✗ Delete jobs (Admin only)</Text>
              </li>
              <li>
                <Text type="success">✓ View all job details</Text>
              </li>
              <li>
                <Text type="success">✓ Apply for jobs</Text>
              </li>
            </>
          )}
        </ul>
      </div>

      <div
        style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
        }}
      >
        <Text strong>Note: </Text>
        <Text>
          Role detection logic:{' '}
          <code>
            user?.role === 'admin' || user?.role === 'company' || user?.is_admin
            === true
          </code>
        </Text>
      </div>
    </Card>
  );
};

export default JobsTest;
