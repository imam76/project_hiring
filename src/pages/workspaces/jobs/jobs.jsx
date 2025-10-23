import { useAuthStore } from '@/stores/authStore';
import {
  useCheckUserApplication,
  useCreateJobApplication,
} from '@/utils/hooks/useJobApplications';
import { useJobConfigurationByJobId } from '@/utils/hooks/useJobConfiguration';
import {
  useCreateJob,
  useDeleteJob,
  useJobs,
  useUpdateJob,
} from '@/utils/hooks/useJobList';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
  Divider,
  Drawer,
} from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import JobApplicationForm from './JobApplicationForm';
import JobDetail from './JobDetail';
import JobForm from './JobForm';

const { Title, Text, Paragraph } = Typography;

const JobsPage = () => {
  const navigate = useNavigate();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  // Get user data from auth store
  const { user } = useAuthStore();
  console.log('user =>', user);

  // Check if user is admin or company
  const isAdminOrCompany =
    user?.role === 'admin' ||
    user?.role === 'company' ||
    user?.is_admin === true;

  // Fetch jobs
  const { data: jobs, isLoading, refetch } = useJobs();

  // Mutations
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  const createApplicationMutation = useCreateJobApplication();

  // Fetch job configuration untuk job yang sedang dipilih untuk apply
  const { data: jobConfig, isLoading: jobConfigLoading } =
    useJobConfigurationByJobId(selectedJobForApply?.id);

  const handleCreateJob = async (data) => {
    try {
      const result = await createJobMutation.mutateAsync(data);
      message.success('Job created successfully');
      setCreateModalVisible(false);
      refetch();
      return result; // Return result untuk digunakan di JobForm
    } catch (error) {
      message.error(error.message || 'Failed to create job');
      throw error;
    }
  };

  const handleUpdateJob = async (data) => {
    try {
      const result = await updateJobMutation.mutateAsync({
        id: selectedJob.id,
        updates: data,
      });
      message.success('Job updated successfully');
      setEditModalVisible(false);
      setSelectedJob(null);
      refetch();
      return result; // Return result untuk digunakan di JobForm
    } catch (error) {
      message.error(error.message || 'Failed to update job');
      throw error;
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJobMutation.mutateAsync(jobId);
      message.success('Job deleted successfully');
      refetch();
    } catch (error) {
      message.error(error.message || 'Failed to delete job');
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setEditModalVisible(true);
  };

  const handleApplyJob = (job) => {
    // Buka modal apply (check duplikasi akan dilakukan di button render)
    setSelectedJobForApply(job);
    setApplyModalVisible(true);
  };

  const handleSubmitApplication = async (applicationData) => {
    try {
      await createApplicationMutation.mutateAsync({
        job_id: selectedJobForApply.id,
        user_id: user.id,
        status: 'pending',
        application_data: applicationData,
        notes: null,
      });

      message.success(
        `Berhasil melamar untuk posisi ${selectedJobForApply?.title || ''}`
      );
      setApplyModalVisible(false);
      setSelectedJobForApply(null);
      refetch(); // Refresh jobs list
    } catch (error) {
      console.error('Submit application error:', error);
      if (error.message?.includes('duplicate') || error.code === '23505') {
        message.error('Anda sudah melamar untuk posisi ini');
      } else {
        message.error('Gagal mengirim lamaran. Silakan coba lagi.');
      }
      throw error;
    }
  };

  const handleManageApplications = (jobId) => {
    navigate(`/jobs/${jobId}/applications`);
  };

  // Component helper untuk render Apply button dengan status check
  const ApplyButton = ({ job }) => {
    const { data: existingApplication, isLoading: checkingApplication } =
      useCheckUserApplication(job.id, user?.id);

    const hasApplied = !!existingApplication;

    if (hasApplied) {
      return (
        <Button
          key="applied"
          type="default"
          icon={<CheckCircleOutlined />}
          disabled
        >
          Sudah Melamar
        </Button>
      );
    }

    return (
      <Button
        key="apply"
        type="primary"
        onClick={() => handleApplyJob(job)}
        loading={checkingApplication}
        disabled={checkingApplication}
      >
        Apply
      </Button>
    );
  };

  if (isLoading) {
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
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={2}>Job Listings</Title>
          <Text type="secondary">
            {isAdminOrCompany
              ? 'Manage your job postings'
              : 'Browse and apply for available jobs'}
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
          {isAdminOrCompany && (
            <Button
              type="primary"
              color='primary'
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create Job
            </Button>
          )}
        </Space>
      </div>

      {!jobs || jobs.length === 0 ? (
        <Empty
          description={
            isAdminOrCompany
              ? 'No jobs created yet. Create your first job posting!'
              : 'No jobs available at the moment'
          }
        />
      ) : (
        <Row gutter={16} style={{ flex: 1, overflow: 'hidden' }}>
          {/* Left Column - Job List */}
          <Col
            xs={24}
            sm={24}
            md={10}
            lg={8}
            style={{
              overflow: 'auto',
              borderRight: '1px solid #f0f0f0',
              paddingRight: '16px',
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  hoverable
                  onClick={() => handleSelectJob(job)}
                  style={{
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor:
                      selectedJob?.id === job.id ? '#e6f7ff' : 'white',
                    borderColor:
                      selectedJob?.id === job.id ? '#1890ff' : '#d9d9d9',
                    borderWidth: selectedJob?.id === job.id ? '2px' : '1px',
                  }}
                >
                  <div>
                    <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                      {job.title}
                    </Text>
                    {job.company_name && (
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                        {job.company_name}
                      </Text>
                    )}
                    <div style={{ marginBottom: '8px' }}>
                      {job.location && (
                        <Tag color="blue" style={{ marginBottom: '4px' }}>
                          {job.location}
                        </Tag>
                      )}
                      {job.type && (
                        <Tag color="green">{job.type}</Tag>
                      )}
                    </div>
                    {job.salary_min && job.salary_max && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Rp {job.salary_min.toLocaleString()}
                      </Text>
                    )}
                  </div>
                </Card>
              ))}
            </Space>
          </Col>

          {/* Right Column - Job Details */}
          <Col
            xs={24}
            sm={24}
            md={14}
            lg={16}
            style={{
              overflow: 'auto',
              paddingLeft: '16px',
            }}
          >
            {selectedJob ? (
              <div>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Title level={2}>{selectedJob.title}</Title>
                    <Text type="secondary">{selectedJob.company_name}</Text>
                  </div>
                  <Space>
                    {isAdminOrCompany ? (
                      <>
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(selectedJob)}
                        >
                          Edit
                        </Button>
                        <Button
                          icon={<TeamOutlined />}
                          onClick={() => handleManageApplications(selectedJob.id)}
                        >
                          Manage
                        </Button>
                        <Popconfirm
                          title="Delete job"
                          description="Are you sure you want to delete this job?"
                          onConfirm={() => handleDeleteJob(selectedJob.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button type="primary" danger icon={<DeleteOutlined />}>
                            Delete
                          </Button>
                        </Popconfirm>
                      </>
                    ) : (
                      <ApplyButton job={selectedJob} />
                    )}
                  </Space>
                </div>

                <JobDetail job={selectedJob} />
              </div>
            ) : (
              <Empty description="Pilih pekerjaan dari daftar di sebelah kiri" />
            )}
          </Col>
        </Row>
      )}

      {/* Create Job Modal */}
      <Modal
        title="Create New Job"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
        }}
        footer={null}
        width={800}
      >
        <JobForm
          onSubmit={handleCreateJob}
          onCancel={() => setCreateModalVisible(false)}
          isSubmitting={createJobMutation.isPending}
        />
      </Modal>

      {/* Edit Job Modal */}
      <Modal
        title="Edit Job"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedJob(null);
        }}
        footer={null}
        width={800}
      >
        {selectedJob && (
          <JobForm
            initialData={selectedJob}
            onSubmit={handleUpdateJob}
            onCancel={() => {
              setEditModalVisible(false);
              setSelectedJob(null);
            }}
            isSubmitting={updateJobMutation.isPending}
          />
        )}
      </Modal>

      {/* Apply Job Modal */}
      <Modal
        title={`Melamar untuk: ${selectedJobForApply?.title || ''}`}
        open={applyModalVisible}
        onCancel={() => {
          setApplyModalVisible(false);
          setSelectedJobForApply(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        {selectedJobForApply &&
          (jobConfigLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin tip="Memuat form..." />
            </div>
          ) : (
            <JobApplicationForm
              jobConfig={jobConfig}
              userData={user}
              onSubmit={handleSubmitApplication}
              onCancel={() => {
                setApplyModalVisible(false);
                setSelectedJobForApply(null);
              }}
              isSubmitting={createApplicationMutation.isPending}
            />
          ))}
      </Modal>
    </div>
  );
};

export default JobsPage;
