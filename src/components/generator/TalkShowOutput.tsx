import { Card, Typography, Tag, Timeline, Divider, List } from 'antd';
import { BulbOutlined, MessageOutlined, StarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { GeneratedContent } from '../../types';

const { Title, Paragraph, Text } = Typography;

const SPEAKER_COLORS: Record<string, string> = {
  Comedian: '#E84393',
  Expert: '#0984E3',
  Host: '#00B894',
  Moderator: '#F39C12',
  Villain: '#D63031',
};

interface Props {
  content: GeneratedContent;
}

export default function TalkShowOutput({ content }: Props) {
  return (
    <div style={{ marginTop: 24 }}>
      {/* Intro */}
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)' }}>
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          <BulbOutlined /> Mở đầu
        </Title>
        <Paragraph style={{ color: '#fff', marginTop: 8, marginBottom: 0 }}>{content.intro}</Paragraph>
      </Card>

      {/* Discussion */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={4}><MessageOutlined /> Cuộc thảo luận</Title>
        <Timeline
          items={content.discussion.map((line, i) => ({
            key: i,
            color: SPEAKER_COLORS[line.speaker] || '#6C5CE7',
            children: (
              <div>
                <Tag color={SPEAKER_COLORS[line.speaker] || 'purple'}>{line.speaker}</Tag>
                <Text>{line.text}</Text>
              </div>
            ),
          }))}
        />
      </Card>

      {/* Highlights */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={4}><StarOutlined /> Điểm nổi bật</Title>
        <List
          dataSource={content.highlights}
          renderItem={(item) => (
            <List.Item>
              <Text>⭐ {item}</Text>
            </List.Item>
          )}
        />
      </Card>

      <Divider />

      {/* Summary */}
      <Card style={{ background: '#F8F9FE' }}>
        <Title level={4}><CheckCircleOutlined /> Tổng kết</Title>
        <Paragraph>{content.summary}</Paragraph>
      </Card>
    </div>
  );
}
