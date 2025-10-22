// import navigateToChildRoute from '@/utils/navigateToChild';
import { App } from 'antd';
import { Flex } from 'antd';
import { Dropdown, Typography } from 'antd';
import { Trash } from 'lucide-react';
import { File, Pen } from 'lucide-react';
import { useFetcher, useNavigate } from 'react-router';

const { Text } = Typography;

const ContextMenuOption = ({ children, editPath, deletePath, detailPath }) => {
  // const navigateToChild = navigateToChildRoute();
  const navigate = useNavigate();
  const fetcher = useFetcher({ key: 'action-delete' });
  const { modal } = App.useApp();

  const handleDelete = (deletePath) => {
    modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this contact?',
      onOk: () => {
        fetcher.submit(null, {
          method: 'DELETE',
          action: deletePath,
        });
      },
    });
  };

  const items = [
    {
      key: '1',
      label: (
        <Text onClick={() => navigate(editPath)}>
          <Flex gap={8} align="center">
            <Pen size={16} />
            Edit
          </Flex>
        </Text>
      ),
    },
    {
      key: '2',
      label: (
        <Text type="warning" onClick={() => navigate(detailPath)}>
          <Flex gap={8} align="center">
            <File size={16} />
            Detail
          </Flex>
        </Text>
      ),
    },
    {
      key: '3',
      label: (
        <Text type="danger" onClick={() => handleDelete(deletePath)}>
          <Flex gap={8} align="center">
            <Trash size={16} />
            Delete
          </Flex>
        </Text>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      placement="bottomRight"
      arrow
    >
      {children}
    </Dropdown>
  );
};
export default ContextMenuOption;
