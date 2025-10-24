import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/authStore';
import {
  useJobConfigurationByJobId,
  useUpsertJobConfiguration,
} from '@/utils/hooks/useJobConfiguration';

import MinimumProfileConfig from './MinimumProfileConfig';

const { Option } = Select;

const JobForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const [profileConfig, setProfileConfig] = useState(null);

  const companyName =
    user?.company_name || user?.full_name || user?.email || 'User';

  const { data: jobConfig } = useJobConfigurationByJobId(initialData?.id);
  const upsertConfigMutation = useUpsertJobConfiguration();

  useEffect(() => {
    if (initialData) {
      const formData = {
        ...initialData,
        started_on: initialData.started_on
          ? moment(initialData.started_on)
          : null,
      };
      form.setFieldsValue(formData);
    }
    form.setFieldsValue({ company_name: companyName });
  }, [initialData, form, companyName]);

  useEffect(() => {
    if (jobConfig?.application_form) {
      setProfileConfig(jobConfig.application_form);
    }
  }, [jobConfig]);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      company_id: user?.id,
      started_on: values.started_on
        ? values.started_on.format('YYYY-MM-DD')
        : null,
    };
    payload.company_name = undefined;

    const result = await onSubmit(payload);

    const jobId = result?.id || initialData?.id;
    if (jobId) {
      try {
        await upsertConfigMutation.mutateAsync({
          jobId: jobId,
          configData: {},
        });
      } catch (error) {
        console.error('Failed to save job configuration:', error);
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: 'active',
        currency: 'IDR',
      }}
    >
      <Form.Item
        name="title"
        label="Job Title"
        rules={[{ required: true, message: 'Please enter job title' }]}
      >
        <Input placeholder="e.g. Senior Frontend Developer" />
      </Form.Item>

      <Form.Item
        name="company_name"
        label="Company Name / Posted By"
        tooltip="Company name is automatically set from your user profile"
      >
        <Input placeholder="Company Name" disabled />
      </Form.Item>

      <Form.Item
        name="slug"
        label="Slug"
        tooltip="URL-friendly version of the job title (optional)"
      >
        <Input placeholder="e.g. senior-frontend-developer" />
      </Form.Item>

      <Space.Compact style={{ width: '100%' }}>
        <Form.Item
          name="salary_min"
          label="Minimum Salary"
          style={{ width: '50%', marginRight: 8 }}
          rules={[{ required: true, message: 'Please enter minimum salary' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="5000000"
            min={0}
            formatter={(value) =>
              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="salary_max"
          label="Maximum Salary"
          style={{ width: '50%' }}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="10000000"
            min={0}
            formatter={(value) =>
              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </Space.Compact>

      <Form.Item
        name="currency"
        label="Currency"
        rules={[{ required: true, message: 'Please select currency' }]}
      >
        <Select placeholder="Select currency">
          <Option value="IDR">IDR (Rupiah)</Option>
          <Option value="USD">USD (Dollar)</Option>
          <Option value="EUR">EUR (Euro)</Option>
          <Option value="SGD">SGD (Singapore Dollar)</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="started_on"
        label="Start Date"
        tooltip="When this job posting will be active"
      >
        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
      </Form.Item>

      <Form.Item
        name="job_desc"
        label="Job Description"
        rules={[{ required: true, message: 'Please enter job description' }]}
      >
        <Input.TextArea
          placeholder="Describe the job responsibilities, tasks, and expectations..."
          rows={5}
        />
      </Form.Item>

      <Form.Item
        name="minimum_qualification"
        label="Minimum Qualifications"
        rules={[
          { required: true, message: 'Please enter minimum qualifications' },
        ]}
      >
        <Input.TextArea
          placeholder="List the required education, skills, experience, and certifications..."
          rows={4}
        />
      </Form.Item>

      <Form.Item name="about" label="About">
        <Input.TextArea
          placeholder="Additional information about the company, team, or role..."
          rows={4}
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Please select status' }]}
      >
        <Select placeholder="Select status">
          <Option value="active">Active</Option>
          <Option value="closed">Closed</Option>
          <Option value="draft">Draft</Option>
        </Select>
      </Form.Item>

      <Divider />

      {/* Minimum Profile Information Required */}
      <MinimumProfileConfig value={profileConfig} onChange={setProfileConfig} />

      <Divider />

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting || upsertConfigMutation.isPending}
          >
            {initialData ? 'Update Job' : 'Create Job'}
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default JobForm;
