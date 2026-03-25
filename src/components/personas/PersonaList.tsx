import { useEffect } from 'react';
import { List, Card, Tag, Button, Modal, message, Typography, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePersonaStore } from '../../stores/personaStore';
import type { Persona } from '../../types';

const { Title, Text } = Typography;

export default function PersonaList() {
  const navigate = useNavigate();
  const { personas, isLoading, fetchPersonas, deletePersona } = usePersonaStore();

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const handleDelete = (persona: Persona) => {
    Modal.confirm({
      title: 'Xóa Persona',
      content: `Bạn có chắc muốn xóa "${persona.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deletePersona(persona.id);
          message.success('Đã xóa persona');
        } catch {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>🎭 Personas</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/personas/new')}>
          Tạo mới
        </Button>
      </Space>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
        loading={isLoading}
        dataSource={personas}
        renderItem={(persona: Persona) => (
          <List.Item>
            <Card
              actions={
                persona.is_default
                  ? undefined
                  : [
                      <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/personas/${persona.id}/edit`)} key="edit">Sửa</Button>,
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(persona)} key="delete">Xóa</Button>,
                    ]
              }
            >
              <Card.Meta
                title={
                  <Space>
                    {persona.name}
                    {persona.is_default && <CrownOutlined style={{ color: '#FDCB6E' }} />}
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary">{persona.personality_traits.style || persona.personality_traits.tone}</Text>
                    <div style={{ marginTop: 8 }}>
                      {persona.personality_traits.keywords?.map((k) => (
                        <Tag key={k} color="purple" style={{ marginBottom: 4 }}>{k}</Tag>
                      ))}
                    </div>
                    {persona.is_default && <Tag color="gold" style={{ marginTop: 4 }}>Mặc định</Tag>}
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
