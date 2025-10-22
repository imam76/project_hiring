import { useDataInfiniteScrollQuery } from '@/utils/hooks/useDataInfiniteScrollQuery';
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  Flex,
  List,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import { File, Pen, Trash } from 'lucide-react';
import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const { Text } = Typography;
const ListInfiniteScroll = ({
  queryKey,
  endpoint,
  pageSize,
  filters,
  renderItem,
  onEdit,
  onDetail,
  onDelete,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    data, // Array flat dari semua contact
    loadMore,
    canLoadMore,
  } = useDataInfiniteScrollQuery({
    queryKey: [queryKey],
    getUrl: endpoint,
    filters,
    pageSize: pageSize || 10,
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedItem(null);
  };

  const handleEdit = () => {
    if (selectedItem && onEdit) {
      onEdit(selectedItem);
      handleDrawerClose();
    }
  };

  const handleDetail = () => {
    if (selectedItem && onDetail) {
      onDetail(selectedItem);
      handleDrawerClose();
    }
  };

  const handleDelete = () => {
    if (selectedItem && onDelete) {
      onDelete(selectedItem);
      handleDrawerClose();
    }
  };

  return (
    <>
      <div
        id="scrollableDiv"
        style={{
          height: 400,
          overflow: 'auto',
        }}
      >
        <InfiniteScroll
          dataLength={data.length}
          next={loadMore}
          hasMore={canLoadMore}
          loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
          endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
          scrollableTarget="scrollableDiv"
        >
          <List
            dataSource={data}
            renderItem={(item) =>
              renderItem ? (
                renderItem(item, handleItemClick)
              ) : (
                <List.Item
                  onClick={() => handleItemClick(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar>
                        {item.name?.[0] || item.title?.[0] || '?'}
                      </Avatar>
                    }
                    title={item.name || item.title || 'No Title'}
                    description={
                      item.description || item.email || 'No Description'
                    }
                  />
                </List.Item>
              )
            }
          />
        </InfiniteScroll>
      </div>
      <Drawer
        title="Actions"
        placement="bottom"
        onClose={handleDrawerClose}
        open={drawerOpen}
        height={300}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button
            color="primary"
            variant="filled"
            onClick={handleEdit}
            block
            size="large"
            style={{ height: 'auto', padding: '12px' }}
          >
            <Flex gap={8} align="center" justify="flex-start">
              <Pen size={16} />
              <Text style={{ color: '#1677ff' }}>Edit</Text>
            </Flex>
          </Button>
          <Button
            color="orange"
            variant="filled"
            onClick={handleDetail}
            block
            size="large"
            style={{ height: 'auto', padding: '12px' }}
          >
            <Flex gap={8} align="center" justify="flex-start">
              <File size={16} />
              <Text type="warning">Detail</Text>
            </Flex>
          </Button>
          <Button
            color="danger"
            variant="filled"
            onClick={handleDelete}
            block
            size="large"
            style={{ height: 'auto', padding: '12px' }}
          >
            <Flex gap={8} align="center" justify="flex-start">
              <Trash size={16} />
              <Text type="danger">Delete</Text>
            </Flex>
          </Button>
        </Space>
      </Drawer>
    </>
  );
};
export default ListInfiniteScroll;
