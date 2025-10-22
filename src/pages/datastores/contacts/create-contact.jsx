import { App, Breadcrumb, Flex } from 'antd';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useDataQuery } from '@/utils/hooks/useDataQuery';
import { zodResolver } from '@hookform/resolvers/zod';

import { ContactFormSchema } from './constant';
import Forms from './forms';

const CreateContact = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const {
    // register,
    handleSubmit,
    // getValues,
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

  const endpoints = '/api/v1/contacts';

  const { isSubmitting, submit } = useDataQuery({
    queryKey: ['contacts'],
    getUrl: endpoints,
    method: 'POST',
    queryOptions: {
      enabled: false, // Disable initial fetch
    },
    submitUrl: endpoints,
    onSuccess: () => {
      notification.success({
        message: 'Contact Created',
        description: 'Contact has been successfully Created.',
        duration: 3,
      });
      navigate('/datastores/contacts');
    },
    onError: (err) => {
      notification.success({
        message: 'Contact Creation Failed',
        description: err.message || 'Failed to create contact.',
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
    submit(data);
  };

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
              title: 'Add Contacts',
            },
          ]}
        />
      </Flex>

      <Forms
        title="Create Contact"
        control={control}
        handleSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        errors={errors}
      />
    </Flex>
  );
};

export default CreateContact;
