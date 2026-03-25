import { Select, Space, Typography } from 'antd';
import { useEpisodeStore } from '../../stores/episodeStore';
import type { Mood, SortField, SortOrder } from '../../types';

const { Text } = Typography;

const MOODS: Mood[] = ['funny', 'serious', 'controversial', 'thought-provoking', 'casual'];
const TAGS = ['AI', 'Tech', 'Finance', 'Relationships', 'Science', 'Politics', 'Health', 'Entertainment'];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'created_at-desc', label: 'Mới nhất' },
  { value: 'created_at-asc', label: 'Cũ nhất' },
  { value: 'topic-asc', label: 'Chủ đề (A-Z)' },
  { value: 'topic-desc', label: 'Chủ đề (Z-A)' },
];

export default function EpisodeFilterBar() {
  const { filters, setFilterTags, setFilterMood, setSort } = useEpisodeStore();

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-') as [SortField, SortOrder];
    setSort(field, order);
  };

  return (
    <Space wrap style={{ marginBottom: 16, width: '100%' }}>
      <div style={{ minWidth: 150, flex: 1 }}>
        <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Tags</Text>
        <Select
          mode="multiple"
          placeholder="Lọc theo tags"
          value={filters.tags}
          onChange={setFilterTags}
          style={{ width: '100%', minWidth: 150 }}
          allowClear
        >
          {TAGS.map((t) => (
            <Select.Option key={t} value={t}>{t}</Select.Option>
          ))}
        </Select>
      </div>

      <div style={{ minWidth: 130 }}>
        <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Tâm trạng</Text>
        <Select
          placeholder="Lọc theo mood"
          value={filters.mood}
          onChange={setFilterMood}
          style={{ width: '100%', minWidth: 130 }}
          allowClear
        >
          {MOODS.map((m) => (
            <Select.Option key={m} value={m}>{m}</Select.Option>
          ))}
        </Select>
      </div>

      <div style={{ minWidth: 140 }}>
        <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Sắp xếp</Text>
        <Select
          defaultValue="created_at-desc"
          onChange={handleSortChange}
          options={SORT_OPTIONS}
          style={{ width: '100%', minWidth: 140 }}
        />
      </div>
    </Space>
  );
}
