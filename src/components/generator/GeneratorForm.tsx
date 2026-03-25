import { useState } from 'react';
import { Form, Input, Select, Button, Card, Typography, Space, Alert } from 'antd';
import { ThunderboltOutlined, SaveOutlined } from '@ant-design/icons';
import { useGeneratorStore } from '../../stores/generatorStore';
import PersonaSelector from './PersonaSelector';
import TalkShowOutput from './TalkShowOutput';
import SaveEpisodeModal from './SaveEpisodeModal';
import type { ToneLevel, ConversationLength } from '../../types';

const { Title } = Typography;

const TONES: { value: ToneLevel; label: string }[] = [
  { value: 'light', label: '🌤️ Nhẹ nhàng' },
  { value: 'balanced', label: '⚖️ Cân bằng' },
  { value: 'deep debate', label: '🔥 Tranh luận sâu' },
];

const LENGTHS: { value: ConversationLength; label: string }[] = [
  { value: 'short', label: '⚡ Ngắn' },
  { value: 'medium', label: '📺 Trung bình' },
  { value: 'long', label: '🎬 Dài' },
];

export default function GeneratorForm() {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const {
    topic, tone, length: convLength,
    selectedPersonas, output, isGenerating, error,
    setTopic, setTone, setLength, generate, reset,
  } = useGeneratorStore();

  const canGenerate = topic.trim() && selectedPersonas.length > 0;

  return (
    <div>
      <Title level={3}>🎙️ Tạo Talk Show mới</Title>

      <Card>
        <Form layout="vertical">
          <Form.Item label="Chủ đề" required>
            <Input
              placeholder="Nhập chủ đề talk show (ví dụ: Trí tuệ nhân tạo và tương lai)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              size="large"
            />
          </Form.Item>

          <Space size="large" wrap>
            <Form.Item label="Giọng điệu">
              <Select
                value={tone}
                onChange={(v) => setTone(v)}
                options={TONES}
                style={{ minWidth: 160, width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Độ dài">
              <Select
                value={convLength}
                onChange={(v) => setLength(v)}
                options={LENGTHS}
                style={{ minWidth: 160, width: '100%' }}
              />
            </Form.Item>
          </Space>

          <PersonaSelector />

          <Space style={{ marginTop: 16 }}>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={generate}
              loading={isGenerating}
              disabled={!canGenerate}
              size="large"
            >
              Tạo Talk Show
            </Button>

            {output && (
              <Button icon={<SaveOutlined />} onClick={() => setSaveModalOpen(true)} size="large">
                Lưu tập
              </Button>
            )}

            <Button onClick={reset}>Đặt lại</Button>
          </Space>
        </Form>
      </Card>

      {error && <Alert type="error" message={error} style={{ marginTop: 16 }} showIcon closable />}

      {output && <TalkShowOutput content={output} />}

      <SaveEpisodeModal open={saveModalOpen} onClose={() => setSaveModalOpen(false)} />
    </div>
  );
}
