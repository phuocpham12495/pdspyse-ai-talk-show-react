import { useEffect } from 'react';
import { Table, Tag, Button, Modal, message, Typography, Space } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEpisodeStore } from '../../stores/episodeStore';
import EpisodeFilterBar from './EpisodeFilterBar';
import type { Episode } from '../../types';

const { Title } = Typography;

export default function EpisodeList() {
  const navigate = useNavigate();
  const { episodes, isLoading, fetchEpisodes, deleteEpisode, filters, sortField, sortOrder } = useEpisodeStore();

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes, filters, sortField, sortOrder]);

  const handleDelete = (episode: Episode) => {
    Modal.confirm({
      title: 'Xóa tập',
      content: `Bạn có chắc muốn xóa tập "${episode.topic}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteEpisode(episode.id);
          message.success('Đã xóa tập thành công');
        } catch {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Chủ đề',
      dataIndex: 'topic',
      key: 'topic',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Giọng điệu',
      dataIndex: 'tone_level',
      key: 'tone_level',
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Tâm trạng',
      dataIndex: 'mood',
      key: 'mood',
      render: (v: string | null) => v ? <Tag color="blue">{v}</Tag> : '-',
    },
    {
      title: 'Tags',
      key: 'tags',
      render: (_: unknown, record: Episode) => (
        <Space size={4} wrap>
          {record.tags?.map((tag) => (
            <Tag key={tag.id} color="purple">{tag.name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: unknown, record: Episode) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/episodes/${record.id}`)}>
            Xem
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>📺 Tập của tôi</Title>
      <EpisodeFilterBar />
      <Table
        columns={columns}
        dataSource={episodes}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
    </div>
  );
}
