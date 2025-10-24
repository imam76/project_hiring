import { Card, Radio, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Title } = Typography;

const PROFILE_FIELDS = [
  { key: 'full_name', label: 'Full name' },
  { key: 'photo_profile', label: 'Photo Profile' },
  { key: 'gender', label: 'Gender' },
  { key: 'domicile', label: 'Domicile' },
  { key: 'email', label: 'Email' },
  { key: 'phone_number', label: 'Phone number' },
  { key: 'linkedin_link', label: 'Linkedin link' },
  { key: 'date_of_birth', label: 'Date of birth' },
];

const MinimumProfileConfig = ({ value, onChange }) => {
  const [fieldStates, setFieldStates] = useState({});

  // Initialize field states from value prop
  useEffect(() => {
    if (value?.sections?.[0]?.fields) {
      const states = {};
      for (const field of value.sections[0].fields) {
        if (field.validation.required === true) {
          states[field.key] = 'mandatory';
        } else if (field.validation.required === false) {
          states[field.key] = 'optional';
        } else {
          states[field.key] = 'off';
        }
      }
      setFieldStates(states);
    } else {
      // Default states
      const defaultStates = {};
      for (const field of PROFILE_FIELDS) {
        defaultStates[field.key] = 'mandatory';
      }
      setFieldStates(defaultStates);
    }
  }, [value]);

  const handleFieldChange = (fieldKey, newValue) => {
    const newFieldStates = {
      ...fieldStates,
      [fieldKey]: newValue,
    };
    setFieldStates(newFieldStates);

    // Convert to expected format and call onChange
    // Remove 'off' fields
    const fields = PROFILE_FIELDS.map((field) => {
      const state = newFieldStates[field.key] || 'mandatory';
      return {
        key: field.key,
        validation: {
          required:
            state === 'mandatory' ? true : state === 'optional' ? false : null,
        },
      };
    }).filter((field) => field.validation.required !== null);

    const formattedValue = {
      sections: [
        {
          title: 'Minimum Profile Information Required',
          fields,
        },
      ],
    };

    if (onChange) {
      onChange(formattedValue);
    }
  };

  return (
    <Card>
      <Title level={5}>Minimum Profile Information Required</Title>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {PROFILE_FIELDS.map((field) => (
          <div
            key={field.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <span style={{ fontSize: '14px' }}>{field.label}</span>
            <Radio.Group
              value={fieldStates[field.key] || 'mandatory'}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="mandatory">Mandatory</Radio.Button>
              <Radio.Button value="optional">Optional</Radio.Button>
              <Radio.Button value="off">Off</Radio.Button>
            </Radio.Group>
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default MinimumProfileConfig;
