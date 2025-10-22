import { Col, DatePicker, Modal, Row, Select, Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { ProForm } from '@ant-design/pro-components';

const { Title } = Typography;

const OPTIONS_STATUS = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

const OPTIONS_CONTACT_TYPE = [
  { label: 'Salesman', value: 'salesman' },
  { label: 'Employee', value: 'employee' },
  { label: 'Supplier', value: 'supplier' },
  { label: 'Customer', value: 'customer' },
];

export default function FilterProduct() {
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isLoading },
  } = useForm({
    defaultValues: {
      contact_type: null,
      is_active: null,
      created_at: null,
    },
  });

  const handleClose = () => {
    navigate(-1);
  };

  const onSubmit = (data) => {
    const filterParams = {};

    if (data.contact_type) {
      filterParams.contact_type = data.contact_type;
    }

    if (data.is_active !== null) {
      filterParams.is_active = data.is_active;
    }

    if (data.created_at) {
      filterParams.created_at = data.created_at.format('YYYY-MM-DD');
    }

    const queryParams = new URLSearchParams(filterParams).toString();
    navigate(`/datastores/products/list?${queryParams}`, { replace: true });
  };

  return (
    <Modal open={true} onCancel={handleClose} footer={null}>
      <Title level={3}>{'Filter'}</Title>

      <ProForm
        disabled={isLoading || isSubmitting}
        onFinish={handleSubmit(onSubmit)}
        onReset={() => navigate(-1)}
        submitter={{
          submitButtonProps: {
            disabled: isLoading || isSubmitting,
            loading: isLoading || isSubmitting,
          },
          searchConfig: {
            submitText: 'Save',
            resetText: 'Close',
          },
        }}
      >
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Controller
              name="contact_type"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select contact type"
                  allowClear
                  style={{ width: '100%' }}
                  options={OPTIONS_CONTACT_TYPE}
                />
              )}
            />
          </Col>

          <Col xs={24}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select status"
                  allowClear
                  style={{ width: '100%' }}
                  options={OPTIONS_STATUS}
                />
              )}
            />
          </Col>

          <Col xs={24}>
            <Controller
              name="created_at"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  placeholder="Select date"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              )}
            />
          </Col>
        </Row>
      </ProForm>
    </Modal>
  );
}
