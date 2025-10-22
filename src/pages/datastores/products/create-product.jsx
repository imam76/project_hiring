import { App, Breadcrumb, Flex } from 'antd';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useDataQuery } from '@/utils/hooks/useDataQuery';
import { zodResolver } from '@hookform/resolvers/zod';

import { ProductFormSchema } from './constant';
import Forms from './forms';

const CreateProduct = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const {
    // register,
    handleSubmit,
    // getValues,
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

  const endpoints = '/api/v1/products';

  const { isSubmitting, submit } = useDataQuery({
    queryKey: ['products'],
    getUrl: endpoints,
    method: 'POST',
    queryOptions: {
      enabled: false, // Disable initial fetch
    },
    submitUrl: endpoints,
    onSuccess: () => {
      notification.success({
        message: 'Product Created',
        description: 'Product has been successfully Created.',
        duration: 3,
      });
      navigate('/datastores/products');
    },
    onError: (err) => {
      notification.success({
        message: 'Product Creation Failed',
        description: err.message || 'Failed to create product.',
        duration: 3,
      });
    },
    filters: {
      per_page: 10,
      page: 1,
      includes: [
        'emails',
        'phones',
        'other_fields',
        'addresses',
        'contact_persons',
        'restricted_departments',
        'restricted_contacts',
        'bank_accounts',
      ],
    },
  });

  const onSubmit = (data) => {
    console.info('Submitting data =>', data);
    submit(data);
  };

  console.log('Form data =>', errors);
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
              title: 'Add Products',
            },
          ]}
        />
      </Flex>

      <Forms
        title="Create Product"
        control={control}
        handleSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        errors={errors}
      />
    </Flex>
  );
};

export default CreateProduct;
