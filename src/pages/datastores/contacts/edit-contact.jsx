import ProSkeleton from '@ant-design/pro-skeleton';
import { App, Breadcrumb, Flex } from 'antd';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

import { useDataQuery } from '@/utils/hooks/useDataQuery';
import { zodResolver } from '@hookform/resolvers/zod';

import { ContactFormSchema } from './constant';
import Forms from './forms';

const EditContact = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();

  const endpoints = `/api/v1/contacts/${id}`;

  const { initialData, isLoading, isSubmitting, submit } = useDataQuery({
    queryKey: ['contacts', endpoints],
    getUrl: endpoints,
    method: 'PUT', // Use PUT for updating existing contact
    submitUrl: endpoints,
    onSuccess: () => {
      notification.success({
        message: 'Contact Updated',
        description: 'Contact has been successfully updated.',
        duration: 3,
      });
      navigate('/datastores/contacts');
    },
    onError: (err) => {
      notification.success({
        message: 'Contact Update Failed',
        description: err.message || 'Failed to update contact.',
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
    resolver: zodResolver(ContactFormSchema),
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
      const { code, name, email, position, contact_type, address } =
        initialData?.results || {};
      reset({
        code: code || '',
        name: name || '',
        email: email || '',
        position: position || '',
        contact_type: contact_type || '',
        address: address || '',
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
              title: 'Contacts',
              onClick: () => navigate('/datastores/contacts'),
            },
            {
              title: 'Edit Contacts',
            },
          ]}
        />
      </Flex>

      <Forms
        title="Edit Contact"
        control={control}
        isLoading={isLoading}
        handleSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        errors={errors}
      />
    </Flex>
  );
};

export default EditContact;
