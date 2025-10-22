import { useAuthStore } from '@/stores';
import { useDataQuery } from '@/utils/hooks/useDataQuery';
import {
  AccountBookOutlined,
  CheckOutlined,
  LogoutOutlined,
  PieChartOutlined,
  SwapOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Dropdown,
  Grid,
  Layout,
  Menu,
  Space,
  Typography,
  message,
} from 'antd';
import { BrainIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import {
  ChevronLeft,
  CreditCard,
  Database,
  LayoutDashboard,
} from 'lucide-react';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';

const { Content, Sider, Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, logout, getCurrentWorkspace, switchWorkspace } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Menggunakan Ant Design's useBreakpoint hook
  const screens = useBreakpoint();
  const isMobile = !screens.md; // md breakpoint = 768px

  const currentWorkspace = getCurrentWorkspace();

  // Fetch available workspaces
  const { initialData: workspacesData, refetch: refetchWorkspaces } =
    useDataQuery({
      queryKey: ['workspaces'],
      getUrl: '/api/v1/workspaces',
    });

  const menuItems = [
    {
      key: '/dashboard',
      icon: <LayoutDashboard size={16} />,
      label: isMobile && !mobileMenuOpen ? '' : 'Dashboard',
    },
    {
      key: '/datastores',
      icon: <Database size={16} />,
      label: isMobile && !mobileMenuOpen ? '' : 'Datastores',
    },
    {
      key: '/workspaces',
      icon: <SwapOutlined />,
      label: isMobile && !mobileMenuOpen ? '' : 'Workspaces',
    },
    {
      key: '/trasactions',
      icon: <CreditCard size={16} />,
      label: isMobile && !mobileMenuOpen ? '' : 'Transactions',
    },
    {
      key: '/reports',
      icon: <PieChartOutlined />,
      label: isMobile && !mobileMenuOpen ? '' : 'Reports',
    },
    {
      key: '/accounts',
      icon: <AccountBookOutlined />,
      label: isMobile && !mobileMenuOpen ? '' : 'Accounts',
    },
    {
      key: '/ai',
      icon: <BrainIcon size={16} />,
      label: isMobile && !mobileMenuOpen ? '' : 'Grooming Ai',
    },
  ];

  const handleClick = ({ key }) => {
    navigate(key);
    // Close mobile menu after navigation
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const handleSwitchWorkspace = (workspace) => {
    switchWorkspace(workspace);
    message.success(`Switched to workspace: ${workspace.name}`);
    refetchWorkspaces(); // Refresh workspace data
  };

  // Get available workspaces and sort them
  const availableWorkspaces = (() => {
    const allWorkspaces = [];

    if (workspacesData?.results && Array.isArray(workspacesData.results)) {
      allWorkspaces.push(...workspacesData.results);
    }

    // Sort workspaces: current workspace first, then others
    return allWorkspaces.sort((a, b) => {
      const aIsCurrent = currentWorkspace?.id === a.id;
      const bIsCurrent = currentWorkspace?.id === b.id;

      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;

      return (a.name || '').localeCompare(b.name || '');
    });
  })();

  // Create workspace dropdown menu items
  const workspaceMenuItems = [
    ...availableWorkspaces.map((workspace) => {
      const isCurrentWorkspace = currentWorkspace?.id === workspace.id;
      return {
        key: `workspace-${workspace.id}`,
        label: (
          <Space>
            {workspace.name || `Workspace ${workspace.id}`}
            {isCurrentWorkspace && (
              <CheckOutlined style={{ color: '#52c41a' }} />
            )}
          </Space>
        ),
        onClick: () => {
          if (!isCurrentWorkspace) {
            handleSwitchWorkspace(workspace);
          }
        },
        disabled: isCurrentWorkspace,
      };
    }),
    {
      type: 'divider',
    },
    {
      key: 'manage-workspaces',
      label: 'Manage Workspaces',
      icon: <SwapOutlined />,
      onClick: () => navigate('/workspaces'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  console.log('aaaaaa =>', currentWorkspace);

  return (
    <Layout hasSider style={{ minHeight: '100vh' }}>
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setMobileMenuOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      <Sider
        collapsible
        collapsed={isMobile ? !mobileMenuOpen : collapsed}
        onCollapse={(value) => {
          if (isMobile) {
            setMobileMenuOpen(!mobileMenuOpen);
          } else {
            setCollapsed(value);
          }
        }}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 0}
        width={isMobile ? '80%' : 200}
        zeroWidthTriggerStyle={{
          top: 16,
          zIndex: 1001,
          height: 20,
        }}
        trigger={<LayoutSiderTrigger collapsed={collapsed} />}
        style={{
          background: '#FFFFFF',
          position: 'fixed',
          top: 0,
          bottom: 0,
          zIndex: 1000,
          maxWidth: isMobile ? '300px' : '200px',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'center' : 'flex-start',
            paddingLeft: isMobile ? 0 : 24,
          }}
        >
          {isMobile ? 'Accounting App' : !collapsed && 'Accounting App'}
        </div>
        <Menu
          onClick={handleClick}
          defaultSelectedKeys={['1']}
          mode="inline"
          items={menuItems}
        />
      </Sider>

      <Layout style={{ marginLeft: isMobile ? 0 : collapsed ? 0 : 200 }}>
        <Header
          style={{
            background: '#fff',
            padding: isMobile ? '0 12px' : '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Space size={isMobile ? 'small' : 'large'}>
            {/* Workspace Selector */}
            {isMobile ? (
              <Dropdown
                menu={{ items: workspaceMenuItems }}
                placement="bottomLeft"
                trigger={['click']}
              >
                <Button type="text" size="small">
                  <SwapOutlined />
                </Button>
              </Dropdown>
            ) : (
              <Space>
                <Typography.Text type="secondary">Workspace:</Typography.Text>
                <Dropdown
                  menu={{ items: workspaceMenuItems }}
                  placement="bottomLeft"
                  trigger={['click']}
                >
                  <Button type="text" style={{ fontWeight: 500 }}>
                    <Space>
                      {currentWorkspace?.name || 'Select Workspace'}
                      <SwapOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </Space>
            )}

            {/* User Menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              {isMobile ? (
                <Avatar
                  icon={<UserOutlined />}
                  size="small"
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} />
                  <Text>
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username || user?.email || 'User'}
                  </Text>
                </Space>
              )}
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: isMobile ? '0px 0px' : '0px 24px',
            borderRadius: 4,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

const LayoutSiderTrigger = ({ collapsed }) => {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
    </div>
  );
};

export default AppLayout;
