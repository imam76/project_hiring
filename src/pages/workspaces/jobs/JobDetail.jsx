import { Descriptions, Divider, Tag, Typography, Badge, Space } from 'antd';

const { Title, Paragraph, Text } = Typography;

const JobDetail = ({ job }) => {
  // Company name dari relasi user atau fallback
  const companyName = job.user
    ? job.user.company_name || job.user.full_name || job.user.email
    : job.company_name || `User ID: ${job.company_id}`;

  return (
    <div>
      {/* <Title level={3}>{job.title}</Title>
      <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}>
        {companyName}
      </Text> */}

      {/* Address */}
      {job.location && (
        <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}>
          📍 {job.location}
        </Text>
      )}

      {/* Badges Section */}
      <Space direction="horizontal" size="small">
        {job.salary_min && job.salary_max && (
          <div>
            <Badge
              color='blue'
              count={`Rp${(job.salary_min / 1000000).toFixed(1)}M - Rp${(job.salary_max / 1000000).toFixed(1)}M`}
            />
          </div>
        )}
        <div>
          {job.type && (
            <Badge count={job.type} color='blue' />
          )}
          {job.status && (
            <Badge
              count={job.status}
              color='blue'
            />
          )}
        </div>
      </Space>

      {job.description && (
        <>
          <Title level={4}>Job Description</Title>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {job.description}
          </Paragraph>
        </>
      )}

      {job.job_desc && (
        <>
          <Divider />
          <Title level={4}>Job Description</Title>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {job.job_desc}
          </Paragraph>
        </>
      )}

      {job.minimum_qualification && (
        <>
          <Divider />
          <Title level={4}>Minimum Qualifications</Title>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {job.minimum_qualification}
          </Paragraph>
        </>
      )}

      {job.about && (
        <>
          <Divider />
          <Title level={4}>About</Title>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {job.about}
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
