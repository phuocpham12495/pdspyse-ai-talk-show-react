import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Spin, Tag, Space, Typography, Divider, message, Switch } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEpisodeStore } from '../../stores/episodeStore';
import TalkShowOutput from '../generator/TalkShowOutput';
import CommentSection from '../feed/CommentSection';

const { Title, Text } = Typography;

export default function EpisodeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentEpisode, isLoading, fetchEpisodeById, togglePublic } = useEpisodeStore();

  const isPublicView = location.pathname.startsWith('/feed/');

  useEffect(() => {
    if (id) fetchEpisodeById(id);
  }, [id, fetchEpisodeById]);

  if (isLoading || !currentEpisode) {
    return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>

      <Title level={3}>{currentEpisode.topic}</Title>

      <Space wrap style={{ marginBottom: 16 }}>
        <Tag color="blue">{currentEpisode.tone_level}</Tag>
        <Tag color="green">{currentEpisode.conversation_length}</Tag>
        {currentEpisode.mood && <Tag color="orange">{currentEpisode.mood}</Tag>}
        {currentEpisode.tags?.map((tag) => (
          <Tag key={tag.id} color="purple">{tag.name}</Tag>
        ))}
        {currentEpisode.is_public && <Tag color="cyan">Công khai</Tag>}
      </Space>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Tạo lúc: {new Date(currentEpisode.created_at).toLocaleString('vi-VN')}
      </Text>

      {!isPublicView && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Text>Trạng thái:</Text>
            <Switch
              checked={currentEpisode.is_public}
              checkedChildren="Công khai"
              unCheckedChildren="Riêng tư"
              onChange={async (checked) => {
                try {
                  await togglePublic(currentEpisode.id, checked);
                  message.success(checked ? 'Đã chuyển sang công khai' : 'Đã chuyển sang riêng tư');
                } catch {
                  message.error('Không thể thay đổi trạng thái');
                }
              }}
            />
          </Space>
        </div>
      )}

      <TalkShowOutput content={currentEpisode.generated_content} />

      {(isPublicView || currentEpisode.is_public) && id && (
        <>
          <Divider />
          <Title level={4} id="comments">💬 Bình luận</Title>
          <CommentSection episodeId={id} />
        </>
      )}
    </div>
  );
}
