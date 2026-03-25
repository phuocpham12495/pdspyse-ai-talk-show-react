import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Spin, Tag, Space, Typography, Divider, message, Tooltip } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, HeartFilled, ShareAltOutlined } from '@ant-design/icons';
import { useEpisodeStore } from '../../stores/episodeStore';
import { useFeedStore } from '../../stores/feedStore';
import TalkShowOutput from '../generator/TalkShowOutput';
import CommentSection from '../feed/CommentSection';

const { Title, Text } = Typography;

export default function EpisodeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentEpisode, isLoading, fetchEpisodeById } = useEpisodeStore();
  const { toggleLike } = useFeedStore();
  const [liked, setLiked] = useState(false);

  const isPublicView = location.pathname.startsWith('/feed/');

  useEffect(() => {
    if (id) fetchEpisodeById(id);
  }, [id, fetchEpisodeById]);

  const handleLike = async () => {
    if (!id) return;
    try {
      const isLiked = await toggleLike(id);
      setLiked(isLiked);
    } catch {
      message.error('Không thể thực hiện');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép liên kết!');
    } catch {
      message.error('Không thể sao chép');
    }
  };

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

      {/* Social action buttons for public episodes */}
      {(isPublicView || currentEpisode.is_public) && (
        <Space style={{ marginBottom: 16 }}>
          <Tooltip title={liked ? 'Bỏ thích' : 'Thích'}>
            <Button
              icon={liked ? <HeartFilled style={{ color: '#E17055' }} /> : <HeartOutlined />}
              onClick={handleLike}
            >
              {liked ? 'Đã thích' : 'Thích'}
            </Button>
          </Tooltip>
          <Tooltip title="Chia sẻ">
            <Button icon={<ShareAltOutlined />} onClick={handleShare}>
              Chia sẻ
            </Button>
          </Tooltip>
        </Space>
      )}

      <TalkShowOutput content={currentEpisode.generated_content} />

      {/* Comments section for public episodes */}
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
