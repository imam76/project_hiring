import {
  ArrowLeftOutlined,
  CloseOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import {
  useApplicationsByJobId,
  useUpdateApplicationStatus,
  useUpdateJobApplication,
} from '@/utils/hooks/useJobApplications';
import { useJob } from '@/utils/hooks/useJobList';

const { TextArea } = Input;

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLORS = {
  pending: 'gold',
  reviewing: 'blue',
  shortlisted: 'cyan',
  interview: 'purple',
  accepted: 'green',
  rejected: 'red',
  withdrawn: 'default',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const JobApplicationsManage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesForm] = Form.useForm();

  const { data: job, isLoading: jobLoading } = useJob(jobId);
  const {
    data: applications,
    isLoading: applicationsLoading,
    refetch,
  } = useApplicationsByJobId(jobId);

  const updateStatusMutation = useUpdateApplicationStatus();
  const updateApplicationMutation = useUpdateJobApplication();

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: applicationId,
        status: newStatus,
      });
      message.success('Status berhasil diupdate');
      refetch();
    } catch (error) {
      message.error(error.message || 'Gagal update status');
    }
  };

  const handleViewDetail = (application) => {
    setSelectedApplication(application);
    setDetailModalVisible(true);
    setEditingNotes(false);
    notesForm.setFieldsValue({ notes: application.notes || '' });
  };

  const handleSaveNotes = async (values) => {
    try {
      await updateApplicationMutation.mutateAsync({
        id: selectedApplication.id,
        updates: {
          notes: values.notes,
        },
      });
      message.success('Catatan berhasil disimpan');
      setEditingNotes(false);
      refetch();
      setSelectedApplication({
        ...selectedApplication,
        notes: values.notes,
      });
    } catch (error) {
      message.error(error.message || 'Gagal menyimpan catatan');
    }
  };

  const columns = [
    {
      title: 'Applicant',
      key: 'applicant',
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            size="large"
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <div>
              <Text strong>{record.applicant?.full_name || 'N/A'}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.applicant?.email || 'N/A'}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.applicant?.phone_number && (
            <Text copyable style={{ fontSize: '12px' }}>
              <PhoneOutlined /> {record.applicant.phone_number}
            </Text>
          )}
          {record.applicant?.email && (
            <Text copyable style={{ fontSize: '12px' }}>
              <MailOutlined /> {record.applicant.email}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Application Data',
      dataIndex: 'application_data',
      key: 'application_data',
      render: (data) => {
        if (!data || typeof data !== 'object') return '-';
        const keys = Object.keys(data);
        if (keys.length === 0) return '-';
        return (
          <Text style={{ fontSize: '12px' }}>
            {keys.length} fields submitted
          </Text>
        );
      },
    },
    {
      title: 'Applied Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <div>
          <div>{moment(date).format('DD MMM YYYY')}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            {moment(date).format('HH:mm')}
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => (
        <div>
          <div>{moment(date).format('DD MMM YYYY')}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            {moment(date).format('HH:mm')}
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.updated_at) - new Date(b.updated_at),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          style={{ width: 130 }}
          size="small"
          loading={updateStatusMutation.isPending}
        >
          {STATUS_OPTIONS.map((option) => (
            <Option key={option.value} value={option.value}>
              <Tag color={STATUS_COLORS[option.value]}>{option.label}</Tag>
            </Option>
          ))}
        </Select>
      ),
      filters: STATUS_OPTIONS.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          View Details
        </Button>
      ),
    },
  ];

  if (jobLoading || applicationsLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/jobs')}
          style={{ marginBottom: '16px' }}
        >
          Back to Jobs
        </Button>

        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={3} style={{ margin: 0 }}>
              {job?.title || 'Job Applications'}
            </Title>
            <Text type="secondary">{job?.company_name}</Text>
            <div>
              <Tag color="blue">
                {applications?.length || 0} Total Applications
              </Tag>
              <Tag color="gold">
                {applications?.filter((a) => a.status === 'pending').length ||
                  0}{' '}
                Pending
              </Tag>
              <Tag color="green">
                {applications?.filter((a) => a.status === 'accepted').length ||
                  0}{' '}
                Accepted
              </Tag>
            </div>
          </Space>
        </Card>
      </div>

      {/* Applications Table */}
      {!applications || applications.length === 0 ? (
        <Card>
          <Empty description="There are no candidates applying yet" />
        </Card>
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={applications}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} applications`,
            }}
          />
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        title="Application Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedApplication(null);
          setEditingNotes(false);
        }}
        footer={null}
        width={700}
      >
        {selectedApplication && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Applicant Info */}
            <Card title="Applicant Information">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="User ID">
                  <Text code>{selectedApplication.user_id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Name">
                  {selectedApplication.applicant?.full_name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Text copyable>
                    {selectedApplication.applicant?.email || 'N/A'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <Text copyable>
                    {selectedApplication.applicant?.phone_number || 'N/A'}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Application Data */}
            {selectedApplication.application_data &&
              typeof selectedApplication.application_data === 'object' && (
                <Card title="Application Data">
                  <Descriptions column={1} bordered size="small">
                    {Object.entries(selectedApplication.application_data).map(
                      ([key, value]) => (
                        <Descriptions.Item
                          key={key}
                          label={key.replace(/_/g, ' ').toUpperCase()}
                        >
                          {typeof value === 'object'
                            ? JSON.stringify(value, null, 2)
                            : value || '-'}
                        </Descriptions.Item>
                      ),
                    )}
                  </Descriptions>
                </Card>
              )}

            {/* Status & Notes */}
            <Card title="Application Status & Timeline">
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="middle"
              >
                <div>
                  <Text strong>Current Status: </Text>
                  <Tag color={STATUS_COLORS[selectedApplication.status]}>
                    {selectedApplication.status?.toUpperCase()}
                  </Tag>
                </div>
                <div>
                  <Text strong>Applied Date: </Text>
                  <Text>
                    {moment(selectedApplication.created_at).format(
                      'DD MMMM YYYY, HH:mm',
                    )}
                  </Text>
                </div>
                <div>
                  <Text strong>Last Updated: </Text>
                  <Text>
                    {moment(selectedApplication.updated_at).format(
                      'DD MMMM YYYY, HH:mm',
                    )}
                  </Text>
                </div>
              </Space>
            </Card>

            {/* Notes Section */}
            <Card
              title="Internal Notes (Recruiter Only)"
              extra={
                !editingNotes ? (
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => setEditingNotes(true)}
                  >
                    Edit
                  </Button>
                ) : null
              }
            >
              {!editingNotes ? (
                <div style={{ minHeight: '60px' }}>
                  {selectedApplication.notes ? (
                    <Text style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedApplication.notes}
                    </Text>
                  ) : (
                    <Text type="secondary" italic>
                      Belum ada catatan. Klik Edit untuk menambahkan catatan
                      internal.
                    </Text>
                  )}
                </div>
              ) : (
                <Form
                  form={notesForm}
                  onFinish={handleSaveNotes}
                  layout="vertical"
                >
                  <Form.Item name="notes" style={{ marginBottom: '12px' }}>
                    <TextArea
                      rows={4}
                      placeholder="Tambahkan catatan internal tentang kandidat ini..."
                      autoFocus
                    />
                  </Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={updateApplicationMutation.isPending}
                    >
                      Simpan
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => {
                        setEditingNotes(false);
                        notesForm.setFieldsValue({
                          notes: selectedApplication.notes || '',
                        });
                      }}
                    >
                      Batal
                    </Button>
                  </Space>
                </Form>
              )}
            </Card>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default JobApplicationsManage;
