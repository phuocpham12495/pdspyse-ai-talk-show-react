import { useEffect, useState } from 'react';
import { Card, Tag, Typography, Space, Avatar, Button, message, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled, MessageOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useFeedStore } from '../../stores/feedStore';
import { socialService } from '../../services/socialService';
import type { Episode } from '../../types';

const { Text, Paragraph } = Typography;

interface Props {
  episode: Episode;
  onLikeToggled?: () => void;
}

export default function EpisodeCard({ episode, onLikeToggled }: Props) {
  const navigate = useNavigate();
  const { toggleLike } = useFeedStore();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(episode.likes_count || 0);

  useEffect(() => {
    socialService.hasLiked(episode.id).then(setLiked).catch(() => {});
  }, [episode.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isLiked = await toggleLike(episode.id);
      setLiked(isLiked);
      setLikesCount((prev) => isLiked ? prev + 1 : prev - 1);
      onLikeToggled?.();
    } catch {
      message.error('Không thể thực hiện');
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/feed/${episode.id}#comments`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/feed/${episode.id}`);
      message.success('Đã sao chép liên kết!');
    } catch {
      message.error('Không thể sao chép');
    }
  };

  return (
    <Card
      hoverable
      onClick={() => navigate(`/feed/${episode.id}`)}
      style={{ marginBottom: 16 }}
      actions={[
        <Tooltip title={liked ? 'Bỏ thích' : 'Thích'} key="like">
          <Button
            type="text"
            icon={liked ? <HeartFilled style={{ color: '#E17055' }} /> : <HeartOutlined />}
            onClick={handleLike}
          >
            {likesCount}
          </Button>
        </Tooltip>,
        <Tooltip title="Bình luận" key="comment">
          <Button type="text" icon={<MessageOutlined />} onClick={handleComment}>
            {episode.comments_count || 0}
          </Button>
        </Tooltip>,
        <Tooltip title="Chia sẻ" key="share">
          <Button type="text" icon={<ShareAltOutlined />} onClick={handleShare}>
            Chia sẻ
          </Button>
        </Tooltip>,
      ]}
    >
      <Card.Meta
        avatar={
          <Avatar style={{ background: '#6C5CE7' }}>
            {episode.user?.email?.charAt(0).toUpperCase() || '?'}
          </Avatar>
        }
        title={episode.topic}
        description={
          <div>
            <Space wrap style={{ marginBottom: 8 }}>
              <Tag color="blue">{episode.tone_level}</Tag>
              {episode.mood && <Tag color="orange">{episode.mood}</Tag>}
              {episode.tags?.map((tag) => (
                <Tag key={tag.id} color="purple">{tag.name}</Tag>
              ))}
            </Space>

            <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
              {episode.generated_content?.intro || ''}
            </Paragraph>

            <Space split={<Text type="secondary">·</Text>}>
              <Text type="secondary">{episode.user?.email || 'Ẩn danh'}</Text>
              <Text type="secondary">
                {new Date(episode.created_at).toLocaleDateString('vi-VN')}
              </Text>
            </Space>
          </div>
        }
      />
    </Card>
  );
}
