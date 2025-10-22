import { Button, Card, Flex, Typography } from 'antd';
import { LucideDownload } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { useNavigate } from 'react-router';

import {
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

import proStyle from '@/styles/proComponentStyle';

const { Title, Text } = Typography;

const Forms = ({
  title,
  control,
  isLoading,
  isSubmitting,
  handleSubmit,
  isDetail = false,
  errors,
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <Flex justify="space-between">
        <Title level={3}>{title}</Title>
        <Button variant="outlined" color="primary">
          <LucideDownload size={16} />
          Import From CSV
        </Button>
      </Flex>
      <ProForm
        grid={true}
        disabled={isLoading || isSubmitting}
        readonly={isDetail}
        onFinish={handleSubmit}
        onReset={() => navigate(-1)}
        submitter={{
          submitButtonProps: {
            disabled: isLoading || isSubmitting,
            loading: isLoading || isSubmitting,
            style: {
              display: isDetail ? 'none' : 'inline-block',
            },
          },
          searchConfig: {
            submitText: 'Save',
            resetText: 'Close',
          },
        }}
      >
        <ProForm.Group>
          <Controller
            name="name"
            control={control}
            render={(form) => (
              <ProFormText
                {...form.field}
                label="Name"
                placeholder={''}
                colProps={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}
                validateStatus={errors.name && 'error'}
                extra={
                  <Text style={{ fontSize: 12 }} type="danger">
                    {errors?.name?.message}
                  </Text>
                }
                labelCol={{
                  style: {
                    //ant-form-item-label padding
                    paddingBottom: proStyle.ProFormText.labelCol.style.padding,
                  },
                }}
              />
            )}
          />

          <Controller
            name="code"
            control={control}
            render={(form) => (
              <ProFormText
                {...form.field}
                label="Code"
                placeholder={''}
                colProps={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}
                validateStatus={errors.code && 'error'}
                extra={
                  <Text style={{ fontSize: 12 }} type="danger">
                    {errors?.code?.message}
                  </Text>
                }
                labelCol={{
                  style: {
                    //ant-form-item-label padding
                    paddingBottom: proStyle.ProFormText.labelCol.style.padding,
                  },
                }}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={(form) => (
              <ProFormText
                {...form.field}
                label="Email"
                placeholder={''}
                colProps={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}
                validateStatus={errors.email && 'error'}
                extra={
                  <Text style={{ fontSize: 12 }} type="danger">
                    {errors?.email?.message}
                  </Text>
                }
                labelCol={{
                  style: {
                    //ant-form-item-label padding
                    paddingBottom: proStyle.ProFormText.labelCol.style.padding,
                  },
                }}
              />
            )}
          />

          <Controller
            name="position"
            control={control}
            render={(form) => (
              <ProFormText
                {...form.field}
                label="Position"
                placeholder={''}
                colProps={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}
                validateStatus={errors.position && 'error'}
                extra={
                  <Text style={{ fontSize: 12 }} type="danger">
                    {errors?.position?.message}
                  </Text>
                }
                labelCol={{
                  style: {
                    //ant-form-item-label padding
                    paddingBottom: proStyle.ProFormText.labelCol.style.padding,
                  },
                }}
              />
            )}
          />

          <Controller
            name="contact_type"
            control={control}
            render={(form) => (
              <ProFormSelect
                {...form.field}
                label="Contact Type"
                placeholder="Select contact type"
                colProps={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}
                validateStatus={errors.contact_type && 'error'}
                extra={
                  <Text style={{ fontSize: 12 }} type="danger">
                    {errors?.contact_type?.message}
                  </Text>
                }
                options={[
                  { label: 'Customer', value: 'customer' },
                  { label: 'Supplier', value: 'supplier' },
                  { label: 'Employee', value: 'employee' },
                  { label: 'Salesman', value: 'salesman' },
                ]}
                labelCol={{
                  style: {
                    //ant-form-item-label padding
                    paddingBottom: proStyle.ProFormText.labelCol.style.padding,
                  },
                }}
              />
            )}
          />
        </ProForm.Group>

        <Controller
          name="address"
          control={control}
          render={(form) => (
            <ProFormTextArea
              {...form.field}
              label="Address"
              placeholder={''}
              validateStatus={errors.address && 'error'}
              extra={
                <Text style={{ fontSize: 12 }} type="danger">
                  {errors?.address?.message}
                </Text>
              }
              labelCol={{
                style: {
                  //ant-form-item-label padding
                  paddingBottom: proStyle.ProFormText.labelCol.style.padding,
                },
              }}
            />
          )}
        />
      </ProForm>
    </Card>
  );
};

export default Forms;
