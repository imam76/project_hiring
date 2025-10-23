import HandPoseCapture from '@/components/HandPoseCapture';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Radio,
  Space,
  Typography,
  Upload,
  message as antMessage,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

const { Text } = Typography;

// Helper untuk convert file ke base64
const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const JobApplicationForm = ({
  jobConfig,
  userData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [form] = Form.useForm();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Extract fields dari jobConfig
  const fields = jobConfig?.application_form?.sections?.[0]?.fields || [];

  useEffect(() => {
    // Pre-fill form dengan data user
    if (userData) {
      const initialValues = {
        full_name: userData.full_name || userData.username || '',
        email: userData.email || '',
        phone_number: userData.phone_number || '',
        gender: userData.gender || undefined,
        domicile: userData.domicile || '',
        linkedin_link: userData.linkedin_link || '',
        date_of_birth: userData.date_of_birth
          ? moment(userData.date_of_birth)
          : undefined,
      };
      form.setFieldsValue(initialValues);

      // Set photo preview jika ada
      if (userData.photo_profile) {
        setPhotoPreview(userData.photo_profile);
      }
    }
  }, [userData, form]);

  // Handle photo upload
  const handlePhotoChange = async (info) => {
    const file = info.file.originFileObj || info.file;

    if (file) {
      // Validasi file
      const isImage = file.type?.startsWith('image/');
      if (!isImage) {
        antMessage.error('File harus berupa gambar (JPG/PNG)!');
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        antMessage.error('Ukuran gambar harus lebih kecil dari 2MB!');
        return false;
      }

      try {
        const base64 = await getBase64(file);
        setPhotoPreview(base64);
        setPhotoFile(base64);
        form.setFieldsValue({ photo_profile: base64 });
      } catch {
        antMessage.error('Gagal memproses gambar');
      }
    }
    return false; // Prevent default upload behavior
  };

  const handleSubmit = async (values) => {
    try {
      // Format data untuk dikirim
      const applicationData = {
        ...values,
        photo_profile: photoFile || photoPreview,
        date_of_birth: values.date_of_birth
          ? values.date_of_birth.format('YYYY-MM-DD')
          : undefined,
      };

      // Remove undefined values
      for (const key of Object.keys(applicationData)) {
        if (applicationData[key] === undefined) {
          delete applicationData[key];
        }
      }

      await onSubmit(applicationData);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // Render field berdasarkan tipe
  const renderField = (field) => {
    const isRequired = field.validation?.required === true;
    const fieldKey = field.key;

    switch (fieldKey) {
      case 'full_name':
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label="Nama Lengkap"
            rules={[
              { required: isRequired, message: 'Nama lengkap wajib diisi!' },
            ]}
          >
            <Input
              placeholder="Masukkan nama lengkap"
              prefix={<UserOutlined />}
            />
          </Form.Item>
        );

      case 'photo_profile':
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label="Foto Profil"
            rules={[
              { required: isRequired, message: 'Foto profil wajib diunggah!' },
            ]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {photoPreview && (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #d9d9d9',
                    marginBottom: 8,
                  }}
                >
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}
              <Upload
                accept="image/*"
                beforeUpload={() => false}
                onChange={handlePhotoChange}
                showUploadList={false}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>
                  {photoPreview ? 'Ganti Foto' : 'Upload Foto'}
                </Button>
              </Upload>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Format: JPG/PNG, Maksimal 2MB
              </Text>

              <div
                style={{ height: 1, background: '#f0f0f0', margin: '12px 0' }}
              />
              <Text strong>Atau ambil foto dengan kamera</Text>
              <HandPoseCapture
                width={480}
                height={360}
                mirrored
                showOverlay
                captureLabel="Capture dari Kamera"
                onValid={({ dataUrl, file }) => {
                  setPhotoPreview(dataUrl);
                  setPhotoFile(dataUrl);
                  form.setFieldsValue({ photo_profile: dataUrl });
                  antMessage.success('Pose valid. Foto berhasil diambil.');
                }}
                onInvalid={(msg) => {
                  antMessage.warning(msg || 'Pose tidak valid. Coba lagi.');
                }}
              />
            </Space>
          </Form.Item>
        );

      case 'gender':
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label="Jenis Kelamin"
            rules={[
              { required: isRequired, message: 'Jenis kelamin wajib dipilih!' },
            ]}
          >
            <Radio.Group>
              <Radio value="female">She/her (Female)</Radio>
              <Radio value="male">He/him (Male)</Radio>
            </Radio.Group>
          </Form.Item>
        );

      case 'email':
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label="Email"
            rules={[
              { required: isRequired, message: 'Email wajib diisi!' },
              { type: 'email', message: 'Format email tidak valid!' },
            ]}
          >
            <Input placeholder="contoh@email.com" type="email" />
          </Form.Item>
        );

      case 'phone_number':
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label="Nomor Telepon"
            rules={[
              { required: isRequired, message: 'Nomor telepon wajib diisi!' },
              {
                pattern: /^(\+62|62|0)[0-9]{9,12}$/,
                message: 'Format nomor telepon tidak valid!',
              },
            ]}
          >
            <Input placeholder="+62 812XXXXXXXX" addonBefore="+62" />
          </Form.Item>
        );

      case 'domicile':
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label="Domisili"
            rules={[{ required: isRequired, message: 'Domisili wajib diisi!' }]}
          >
            <Input placeholder="Kota tempat tinggal" />
          </Form.Item>
        );

      case 'linkedin_link':
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label="LinkedIn"
            rules={[
              { required: isRequired, message: 'LinkedIn wajib diisi!' },
              {
                type: 'url',
                message: 'Format URL tidak valid!',
              },
            ]}
          >
            <Input placeholder="https://linkedin.com/in/username" />
          </Form.Item>
        );

      case 'date_of_birth':
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label="Tanggal Lahir"
            rules={[
              { required: isRequired, message: 'Tanggal lahir wajib diisi!' },
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Pilih tanggal lahir"
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                // Disable dates after today
                return current && current > moment().endOf('day');
              }}
            />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={isSubmitting}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {fields.length > 0 ? (
          fields.map((field) => renderField(field))
        ) : (
          <Text type="secondary">
            Tidak ada field yang dikonfigurasi untuk job ini
          </Text>
        )}
      </Space>

      <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Kirim Lamaran
          </Button>
          <Button onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default JobApplicationForm;
