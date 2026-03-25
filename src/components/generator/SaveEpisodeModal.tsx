import { useState } from 'react';
import { Modal, Form, Select, Switch, message } from 'antd';
import { useGeneratorStore } from '../../stores/generatorStore';
import { episodeService } from '../../services/episodeService';
import type { Mood } from '../../types';

const MOODS: Mood[] = ['funny', 'serious', 'controversial', 'thought-provoking', 'casual'];
const SUGGESTED_TAGS = ['AI', 'Tech', 'Finance', 'Relationships', 'Science', 'Politics', 'Health', 'Entertainment'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SaveEpisodeModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { topic, tone, length, output } = useGeneratorStore();

  const handleSave = async () => {
    if (!output) return;

    try {
      const values = await form.validateFields();
      setLoading(true);
      await episodeService.saveEpisode({
        topic,
        tone_level: tone,
        conversation_length: length,
        generated_content: output,
        mood: values.mood || null,
        tags: values.tags || [],
        is_public: values.is_public || false,
      });
      message.success('Đã lưu tập thành công!');
      form.resetFields();
      onClose();
    } catch (err) {
      message.error((err as Error).message || 'Lưu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="💾 Lưu tập Talk Show"
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Tâm trạng" name="mood">
          <Select placeholder="Chọn tâm trạng" allowClear>
            {MOODS.map((m) => (
              <Select.Option key={m} value={m}>{m}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Tags" name="tags">
          <Select mode="tags" placeholder="Thêm tags" tokenSeparators={[',']}>
            {SUGGESTED_TAGS.map((t) => (
              <Select.Option key={t} value={t}>{t}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Công khai" name="is_public" valuePropName="checked">
          <Switch checkedChildren="Công khai" unCheckedChildren="Riêng tư" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
