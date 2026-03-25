import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text } = Typography;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Đăng nhập thành công!');
      navigate('/');
    } catch (err) {
      message.error((err as Error).message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F8F9FE' }}>
      <Card style={{ width: '100%', maxWidth: 400, margin: '0 16px', boxShadow: '0 4px 24px rgba(108,92,231,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: '#6C5CE7', margin: 0 }}>🎙️ Pdspyse AI Talk Show</Title>
            <Text type="secondary">Đăng nhập để tiếp tục</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <Text style={{ textAlign: 'center', display: 'block' }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </Text>
        </Space>
      </Card>
    </div>
  );
}
