import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useAuthStore } from '@/stores/authStore';
import proStyle from '@/styles/proComponentStyle';
import { useDataQuery } from '@/utils/hooks/useDataQuery';
import {
  DeleteOutlined,
  MailOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

// Workspace form schema
export const WorkspaceFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
});

const { Title, Text } = Typography;

const WorkspacePage = () => {
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [assignEmail, setAssignEmail] = useState('');

  // Get workspace data from auth store
  const { getCurrentWorkspace, getAvailableWorkspaces, switchWorkspace, user } =
    useAuthStore();

  const currentWorkspace = getCurrentWorkspace();
  const userWorkspace = getAvailableWorkspaces(); // This is the user's personal workspace

  // Check if user is admin (you may need to adjust this based on your user structure)
  const isAdmin =
    user?.role === 'admin' ||
    user?.is_admin === true ||
    userWorkspace?.user_role === 'Admin';

  // Form handling for create workspace
  const {
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(WorkspaceFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Use useDataQuery to fetch workspaces
  const {
    initialData: workspacesData,
    isLoading,
    refetch,
  } = useDataQuery({
    queryKey: ['workspaces'],
    getUrl: '/api/v1/workspaces',
  });

  // Create workspace mutation
  const { isSubmitting: isCreating, submit: createWorkspace } = useDataQuery({
    queryKey: ['workspaces'],
    getUrl: '/api/v1/workspaces',
    method: 'POST',
    queryOptions: {
      enabled: false, // Disable initial fetch
    },
    submitUrl: '/api/v1/workspaces',
    onSuccess: () => {
      message.success('Workspace created successfully');
      setCreateModalVisible(false);
      reset();
      refetch();
    },
    onError: (err) => {
      message.error(err.message || 'Failed to create workspace');
    },
  });

  // Combine API data with user workspace
  const availableWorkspaces = (() => {
    const allWorkspaces = [];

    // Add workspaces from API
    if (workspacesData?.results && Array.isArray(workspacesData.results)) {
      allWorkspaces.push(...workspacesData.results);
    }

    // Sort workspaces: current workspace first, then others
    return allWorkspaces.sort((a, b) => {
      const aIsCurrent = currentWorkspace?.id === a.id;
      const bIsCurrent = currentWorkspace?.id === b.id;

      // Current workspace comes first
      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;

      // For non-current workspaces, sort alphabetically by name
      return (a.name || '').localeCompare(b.name || '');
    });
  })();

  const handleCreateWorkspace = (data) => {
    createWorkspace(data);
  };

  const handleAssignUser = () => {
    setAssignModalVisible(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignEmail) {
      message.error('Please enter an email address');
      return;
    }

    try {
      // TODO: Implement API call to assign user to workspace
      // await Api().post(`/api/v1/workspaces/${selectedWorkspace.id}/assign`, {
      //   email: assignEmail
      // });

      message.success(`User ${assignEmail} assigned to workspace successfully`);
      setAssignModalVisible(false);
      setAssignEmail('');
      setSelectedWorkspace(null);
      // Refresh workspace list after successful assignment
      refetch();
    } catch (_error) {
      message.error('Failed to assign user to workspace');
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      // TODO: Implement API call to delete workspace
      // await Api().delete(`/api/v1/workspaces/${workspaceId}`);

      message.success('Workspace deleted successfully');
      // Refresh workspace list after successful deletion
      refetch();
      console.log('Deleting workspace:', workspaceId);
    } catch (_error) {
      message.error('Failed to delete workspace');
    }
  };

  const handleSwitchWorkspace = (workspace) => {
    switchWorkspace(workspace);
    message.success(`Switched to workspace: ${workspace.name}`);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={2}>Workspaces</Title>
          <Text type="secondary">
            Manage and switch between your workspaces
          </Text>
          {isLoading && (
            <Text type="secondary" style={{ marginLeft: '16px' }}>
              Loading workspaces...
            </Text>
          )}
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {availableWorkspaces.map((workspace) => {
          const isCurrentWorkspace = currentWorkspace?.id === workspace.id;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={workspace.id}>
              <Card
                hoverable={!isCurrentWorkspace}
                style={{
                  borderRadius: '8px',
                  border: isCurrentWorkspace ? '2px solid #1890ff' : undefined,
                }}
                actions={
                  isAdmin
                    ? [
                        <Button
                          key="assign"
                          type="text"
                          icon={<MailOutlined />}
                          onClick={() => {
                            setSelectedWorkspace(workspace);
                            handleAssignUser();
                          }}
                          title="Assign user by email"
                        >
                          Assign
                        </Button>,
                        <Popconfirm
                          key="delete"
                          title="Delete workspace"
                          description="Are you sure you want to delete this workspace?"
                          onConfirm={() => handleDeleteWorkspace(workspace.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            title="Delete workspace"
                          >
                            Delete
                          </Button>
                        </Popconfirm>,
                      ]
                    : undefined
                }
              >
                <div style={{ marginBottom: '16px' }}>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: '100%' }}
                  >
                    {/* Workspace Name */}
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>
                        {workspace.name || `Workspace ${workspace.id}`}
                      </Text>
                    </div>

                    {/* Owner */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <UserOutlined style={{ color: '#666' }} />
                      <Text type="secondary">
                        Owner:{' '}
                        {workspace.owner?.name ||
                          workspace.owner_name ||
                          'Unknown'}
                      </Text>
                    </div>

                    {/* Status */}
                    <div>
                      <Tag color={isCurrentWorkspace ? 'green' : 'default'}>
                        {isCurrentWorkspace ? 'Active' : 'Available'}
                      </Tag>
                    </div>
                  </Space>
                </div>

                {!isCurrentWorkspace && (
                  <Button
                    type="primary"
                    block
                    onClick={() => handleSwitchWorkspace(workspace)}
                  >
                    Switch to this workspace
                  </Button>
                )}

                {isCurrentWorkspace && (
                  <Button type="default" block disabled>
                    Current Workspace
                  </Button>
                )}
              </Card>
            </Col>
          );
        })}

        {/* Add new workspace card (only for admins) */}
        {isAdmin && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: '8px',
                border: '2px dashed #d9d9d9',
                textAlign: 'center',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setCreateModalVisible(true)}
            >
              <Space direction="vertical" align="center">
                <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
                <Text type="secondary">Create New Workspace</Text>
              </Space>
            </Card>
          </Col>
        )}
      </Row>

      {/* Assign User Modal */}
      <Modal
        title={`Assign User to ${selectedWorkspace?.name || 'Workspace'}`}
        open={assignModalVisible}
        onOk={handleAssignSubmit}
        onCancel={() => {
          setAssignModalVisible(false);
          setAssignEmail('');
          setSelectedWorkspace(null);
        }}
        okText="Assign"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: '16px' }}>
          <Text>
            Enter the email address of the user you want to assign to this
            workspace:
          </Text>
        </div>
        <Input
          placeholder="user@example.com"
          value={assignEmail}
          onChange={(e) => setAssignEmail(e.target.value)}
          prefix={<MailOutlined />}
        />
      </Modal>

      {/* Create Workspace Modal */}
      <Modal
        title="Create New Workspace"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          reset();
        }}
        footer={null}
        width={600}
      >
        <ProForm
          disabled={isCreating}
          onFinish={handleCreateWorkspace}
          submitter={{
            submitButtonProps: {
              disabled: isCreating,
              loading: isCreating,
            },
            searchConfig: {
              submitText: 'Create Workspace',
              resetText: 'Cancel',
            },
            onReset: () => {
              setCreateModalVisible(false);
              reset();
            },
          }}
        >
          <Controller
            name="name"
            control={control}
            render={(form) => (
              <ProFormText
                {...form.field}
                label="Workspace Name"
                placeholder="Enter workspace name"
                validateStatus={errors.name && 'error'}
                extra={
                  <Typography.Text style={{ fontSize: 12 }} type="danger">
                    {errors?.name?.message}
                  </Typography.Text>
                }
                labelCol={{
                  style: {
                    paddingBottom: proStyle.ProFormText.labelCol.style.padding,
                  },
                }}
                rules={[
                  { required: true, message: 'Workspace name is required' },
                ]}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={(form) => (
              <ProFormTextArea
                {...form.field}
                label="Description"
                placeholder="Enter workspace description (optional)"
                validateStatus={errors.description && 'error'}
                extra={
                  <Typography.Text style={{ fontSize: 12 }} type="danger">
                    {errors?.description?.message}
                  </Typography.Text>
                }
                labelCol={{
                  style: {
                    paddingBottom: proStyle.ProFormText.labelCol.style.padding,
                  },
                }}
              />
            )}
          />
        </ProForm>
      </Modal>
    </div>
  );
};

export default WorkspacePage;
