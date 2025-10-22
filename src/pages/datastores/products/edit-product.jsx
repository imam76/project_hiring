import { App, Breadcrumb, Flex } from 'antd';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

import { useDataQuery } from '@/utils/hooks/useDataQuery';
import ProSkeleton from '@ant-design/pro-skeleton';
import { zodResolver } from '@hookform/resolvers/zod';

import { ProductFormSchema } from './constant';
import Forms from './forms';

const EditProduct = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();

  const endpoints = `/api/v1/products/${id}`;

  const { initialData, isLoading, isSubmitting, submit } = useDataQuery({
    queryKey: ['products', endpoints],
    getUrl: endpoints,
    method: 'PUT', // Use PUT for updating existing product
    submitUrl: endpoints,
    onSuccess: () => {
      notification.success({
        message: 'Product Updated',
        description: 'Product has been successfully updated.',
        duration: 3,
      });
      navigate('/datastores/products');
    },
    onError: (err) => {
      notification.success({
        message: 'Product Update Failed',
        description: err.message || 'Failed to update product.',
        duration: 3,
      });
    },
  });

  const {
    // register,
    handleSubmit,
    // getValues,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      code: '',
      name: '',
      email: '',
      position: '',
      contact_type: '',
      address: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      const {
        code,
        name,
        base_unit,
        sku,
        unit_cost,
        selling_price,
        description,
      } = initialData?.results || {};
      reset({
        code: code || '',
        name: name || '',
        base_unit: base_unit || '',
        sku: sku || '',
        unit_cost: unit_cost || '',
        selling_price: selling_price || '',
        description: description || '',
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data) => {
    submit(data);
  };

  if (isLoading) {
    return <ProSkeleton type="descriptions" />;
  }

  return (
    <Flex gap={'large'} vertical>
      <Flex justify="space-between" align="center">
        <Breadcrumb
          separator=">"
          style={{
            cursor: 'pointer',
          }}
          items={[
            {
              title: 'Datastore',
              onClick: () => navigate('/datastores'),
            },
            {
              title: 'Products',
              onClick: () => navigate('/datastores/products'),
            },
            {
              title: 'Edit Products',
            },
          ]}
        />
      </Flex>

      <Forms
        title="Edit Product"
        control={control}
        isLoading={isLoading}
        handleSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        errors={errors}
      />
    </Flex>
  );
};

export default EditProduct;
