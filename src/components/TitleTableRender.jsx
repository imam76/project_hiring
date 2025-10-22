import { Typography } from 'antd';
import { Space } from 'antd';

const { Text } = Typography;

const TitleTableRender = ({ selectedLength }) => {
  if (selectedLength === 0) {
    return null;
  }
  return (
    <Space size={'small'}>
      <Text color="primary">Total Selected Items</Text>
      <Text color="primary">{selectedLength}</Text>
    </Space>
  );
};

export default TitleTableRender;
