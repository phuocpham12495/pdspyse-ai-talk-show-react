import { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Card, Typography, message, Spin } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { usePersonaStore } from '../../stores/personaStore';

const { Title } = Typography;
const { TextArea } = Input;

const TRAIT_OPTIONS = ['funny', 'toxic', 'genius', 'chaotic', 'calm', 'sarcastic', 'witty', 'logical', 'aggressive', 'philosophical'];

export default function PersonaBuilder() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [form] = Form.useForm();
  const { createPersona, updatePersona, personas, fetchPersonas } = usePersonaStore();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setInitialLoading(true);
      const load = async () => {
        if (personas.length === 0) await fetchPersonas();
        setInitialLoading(false);
      };
      load();
    }
  }, [isEdit, personas.length, fetchPersonas]);

  useEffect(() => {
    if (isEdit && personas.length > 0) {
      const persona = personas.find((p) => p.id === id);
      if (persona) {
        form.setFieldsValue({
          name: persona.name,
          keywords: persona.personality_traits.keywords || [],
          description: persona.personality_traits.description || '',
        });
      }
    }
  }, [isEdit, id, personas, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const traits = {
        tone: values.keywords?.[0] || 'neutral',
        style: values.keywords?.join(', ') || '',
        description: values.description || '',
        keywords: values.keywords || [],
      };

      if (isEdit) {
        await updatePersona(id, values.name, traits);
        message.success(`Persona "${values.name}" đã được cập nhật!`);
      } else {
        await createPersona(values.name, traits);
        message.success(`Persona "${values.name}" đã được tạo!`);
      }
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

  if (initialLoading) {
    return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={3}>{isEdit ? '✏️ Sửa Persona' : '✨ Tạo Persona mới'}</Title>
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

          <Button
            type="primary"
            icon={isEdit ? <SaveOutlined /> : <PlusOutlined />}
            onClick={handleSubmit}
            loading={loading}
            size="large"
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo Persona'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
