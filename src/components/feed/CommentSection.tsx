import { useEffect, useState } from 'react';
import { List, Input, Button, Avatar, Typography, Space } from 'antd';
import { SendOutlined, DeleteOutlined } from '@ant-design/icons';
import { useFeedStore } from '../../stores/feedStore';
import { useAuthStore } from '../../stores/authStore';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  episodeId: string;
}

export default function CommentSection({ episodeId }: Props) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { comments, fetchComments, addComment, deleteComment } = useFeedStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchComments(episodeId);
  }, [episodeId, fetchComments]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await addComment(episodeId, text.trim());
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <List
        dataSource={comments}
        renderItem={(comment) => (
          <List.Item
            actions={
              comment.user_id === user?.id
                ? [<Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteComment(comment.id)} key="del" size="small" />]
                : undefined
            }
          >
            <List.Item.Meta
              avatar={<Avatar style={{ background: '#6C5CE7' }}>{comment.user?.email?.charAt(0).toUpperCase() || '?'}</Avatar>}
              title={<Text>{comment.user?.email || 'Ẩn danh'}</Text>}
              description={
                <Space direction="vertical" size={0}>
                  <Text>{comment.content}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(comment.created_at).toLocaleString('vi-VN')}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />

      <Space.Compact style={{ width: '100%', marginTop: 16 }}>
        <TextArea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Viết bình luận..."
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} loading={submitting}>
          Gửi
        </Button>
      </Space.Compact>
    </div>
  );
}
