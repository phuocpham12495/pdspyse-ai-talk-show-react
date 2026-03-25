import { useEffect, useState } from 'react';
import { Typography, Spin, Empty, Pagination } from 'antd';
import { useFeedStore } from '../../stores/feedStore';
import EpisodeCard from './EpisodeCard';

const { Title } = Typography;

const PAGE_SIZE = 10;

export default function PublicFeed() {
  const { publicEpisodes, isLoading, fetchPublicFeed } = useFeedStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPublicFeed();
  }, [fetchPublicFeed]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  }

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedEpisodes = publicEpisodes.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div>
      <Title level={3}>🌍 Cộng đồng Talk Show</Title>

      {publicEpisodes.length === 0 ? (
        <Empty description="Chưa có talk show công khai nào" />
      ) : (
        <>
          {paginatedEpisodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
          {publicEpisodes.length > PAGE_SIZE && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={currentPage}
                total={publicEpisodes.length}
                pageSize={PAGE_SIZE}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
