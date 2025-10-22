import { Button, Card, Flex, Typography } from 'antd';
import { Controller } from 'react-hook-form';
import { useNavigate } from 'react-router';

import proStyle from '@/styles/proComponentStyle';
import {
  ProForm,
  ProFormMoney,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { LucideDownload } from 'lucide-react';

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
        grid
        title={title}
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
            name="base_unit"
            control={control}
            render={(form) => (
              <ProFormText
                {...form.field}
                label="Base unit"
                placeholder={''}
                colProps={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}
                validateStatus={errors.base_unit && 'error'}
                extra={
                  <Text style={{ fontSize: 12 }} type="danger">
                    {errors?.base_unit?.message}
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
            name="sku"
            control={control}
            render={(form) => (
              <ProFormText
                {...form.field}
                label="SKU"
                placeholder={''}
                colProps={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}
                validateStatus={errors.sku && 'error'}
                extra={
                  <Text style={{ fontSize: 12 }} type="danger">
                    {errors?.sku?.message}
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
            name="unit_cost"
            control={control}
            render={(form) => (
              <ProFormMoney
                {...form.field}
                label="Unit Cost"
                placeholder={''}
                colProps={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}
                locale="id-ID"
                validateStatus={errors.unit_cost && 'error'}
                extra={
                  <Text style={{ fontSize: 12 }} type="danger">
                    {errors?.unit_cost?.message}
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
            name="selling_price"
            control={control}
            render={(form) => (
              <ProFormMoney
                {...form.field}
                label="Selling Price"
                placeholder={''}
                colProps={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}
                locale="id-ID"
                validateStatus={errors.selling_price && 'error'}
                extra={
                  <Text style={{ fontSize: 12 }} type="danger">
                    {errors?.selling_price?.message}
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
        </ProForm.Group>
        <Controller
          name="description"
          control={control}
          render={(form) => (
            <ProFormTextArea
              {...form.field}
              label="Description"
              placeholder={''}
              validateStatus={errors.description && 'error'}
              extra={
                <Text style={{ fontSize: 12 }} type="danger">
                  {errors?.description?.message}
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
