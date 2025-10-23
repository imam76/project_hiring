import { Descriptions, Divider, Tag, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const JobDetail = ({ job }) => {
  // Company name dari relasi user atau fallback
  const companyName = job.user
    ? job.user.company_name || job.user.full_name || job.user.email
    : job.company_name || `User ID: ${job.company_id}`;

  return (
    <div>
      <Title level={3}>{job.title}</Title>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Posted By">{companyName}</Descriptions.Item>
        <Descriptions.Item label="Location">{job.location}</Descriptions.Item>
        <Descriptions.Item label="Job Type">
          <Tag color="green">{job.type}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={job.status === 'active' ? 'green' : 'red'}>
            {job.status}
          </Tag>
        </Descriptions.Item>
        {job.salary_min && job.salary_max && (
          <Descriptions.Item label="Salary Range">
            Rp {job.salary_min.toLocaleString()} - Rp{' '}
            {job.salary_max.toLocaleString()}
          </Descriptions.Item>
        )}
        {job.contact_email && (
          <Descriptions.Item label="Contact Email">
            {job.contact_email}
          </Descriptions.Item>
        )}
        {job.contact_phone && (
          <Descriptions.Item label="Contact Phone">
            {job.contact_phone}
          </Descriptions.Item>
        )}
      </Descriptions>

      {job.description && (
        <>
          <Divider />
          <Title level={4}>Job Description</Title>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {job.description}
          </Paragraph>
        </>
      )}

      {job.requirements && (
        <>
          <Divider />
          <Title level={4}>Requirements</Title>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {job.requirements}
          </Paragraph>
        </>
      )}

      {job.created_at && (
        <>
          <Divider />
          <Typography.Text type="secondary">
            Posted on:{' '}
            {new Date(job.created_at).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography.Text>
        </>
      )}
    </div>
  );
};

export default JobDetail;
