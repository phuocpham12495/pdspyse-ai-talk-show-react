import { useEffect, useState } from 'react';
import { Card, Form, Input, DatePicker, Upload, Button, Avatar, Typography, message, Space, Spin, Switch, Select, Divider } from 'antd';
import { UploadOutlined, SaveOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { profileService } from '../../services/profileService';
import { notificationService } from '../../services/notificationService';
import type { User } from '../../types';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      if (data) {
        form.setFieldsValue({
          date_of_birth: data.date_of_birth ? dayjs(data.date_of_birth) : null,
          notifications: data.app_settings?.notifications ?? true,
          theme: data.app_settings?.theme ?? 'light',
          language: data.app_settings?.language ?? 'vi',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = form.getFieldsValue();
      const updated = await profileService.updateProfile({
        date_of_birth: values.date_of_birth?.format('YYYY-MM-DD'),
        app_settings: {
          notifications: values.notifications,
          theme: values.theme,
          language: values.language,
        },
      });
      setProfile(updated);
      message.success('Đã cập nhật hồ sơ!');
    } catch (err) {
      message.error((err as Error).message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const url = await profileService.uploadAvatar(file);
      setProfile((prev) => prev ? { ...prev, avatar_url: url } : prev);
      message.success('Đã cập nhật ảnh đại diện!');
    } catch (err) {
      message.error((err as Error).message || 'Upload thất bại');
    }
    return false;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={3}>👤 Hồ sơ cá nhân</Title>

      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 500 }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar
              size={96}
              src={profile?.avatar_url}
              icon={<UserOutlined />}
              style={{ background: '#6C5CE7', marginBottom: 8 }}
            />
            <div>
              <Upload
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
              </Upload>
            </div>
          </div>

          <Form form={form} layout="vertical">
            <Form.Item label="Email">
              <Input value={user?.email || ''} disabled />
            </Form.Item>

            <Form.Item label="Ngày sinh" name="date_of_birth">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
            </Form.Item>

            <Divider>Cài đặt ứng dụng</Divider>

            <Form.Item label="Nhận thông báo đẩy" name="notifications" valuePropName="checked">
              <Switch
                checkedChildren="Bật"
                unCheckedChildren="Tắt"
                onChange={async (checked) => {
                  if (checked) {
                    const granted = await notificationService.requestPermission();
                    if (granted) {
                      await notificationService.registerServiceWorker();
                      message.success('Đã bật thông báo đẩy!');
                    } else {
                      message.warning('Trình duyệt từ chối quyền thông báo');
                      form.setFieldValue('notifications', false);
                    }
                  }
                }}
              />
            </Form.Item>

            <Form.Item label="Giao diện" name="theme">
              <Select>
                <Select.Option value="light">🌤️ Sáng</Select.Option>
                <Select.Option value="dark">🌙 Tối</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Ngôn ngữ" name="language">
              <Select>
                <Select.Option value="vi">🇻🇳 Tiếng Việt</Select.Option>
                <Select.Option value="en">🇬🇧 English</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Title level={5}>Thông tin tài khoản</Title>
          <Text type="secondary">
            Tham gia từ: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'N/A'}
          </Text>
        </Card>

        <Button danger icon={<LogoutOutlined />} onClick={handleLogout} block>
          Đăng xuất
        </Button>
      </Space>
    </div>
  );
}
