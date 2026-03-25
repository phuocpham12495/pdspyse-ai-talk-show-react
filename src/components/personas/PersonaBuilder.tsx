import { useState } from 'react';
import { Form, Input, Select, Button, Card, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePersonaStore } from '../../stores/personaStore';

const { Title } = Typography;
const { TextArea } = Input;

const TRAIT_OPTIONS = ['funny', 'toxic', 'genius', 'chaotic', 'calm', 'sarcastic', 'witty', 'logical', 'aggressive', 'philosophical'];

export default function PersonaBuilder() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { createPersona } = usePersonaStore();
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await createPersona(values.name, {
        tone: values.keywords?.[0] || 'neutral',
        style: values.keywords?.join(', ') || '',
        description: values.description || '',
        keywords: values.keywords || [],
      });
      message.success(`Persona "${values.name}" đã được tạo!`);
      form.resetFields();
      navigate('/personas');
    } catch (err) {
      if ((err as Error).message) {
        message.error((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3}>✨ Tạo Persona mới</Title>
      <Card style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Persona"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên persona' }]}
          >
            <Input placeholder="Ví dụ: Dr. Sarcasm" size="large" />
          </Form.Item>

          <Form.Item label="Đặc điểm tính cách" name="keywords" rules={[{ required: true, message: 'Chọn ít nhất 1 đặc điểm' }]}>
            <Select mode="tags" placeholder="Chọn hoặc nhập đặc điểm" tokenSeparators={[',']}>
              {TRAIT_OPTIONS.map((t) => (
                <Select.Option key={t} value={t}>{t}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Mô tả chi tiết" name="description">
            <TextArea rows={4} placeholder="Mô tả persona của bạn (tùy chọn)" />
          </Form.Item>

          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} loading={loading} size="large">
            Tạo Persona
          </Button>
        </Form>
      </Card>
    </div>
  );
}
