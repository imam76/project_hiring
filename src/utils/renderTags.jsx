import { Tag } from 'antd';

// Configuration object - add your tags and colors here
const TAG_CONFIGS = {
  inactive: { color: 'volcano', label: 'Looser' },
  active: { color: 'green', label: 'Active' },
  pending: { color: 'orange', label: 'Pending' },
};

const DEFAULT_CONFIG = {
  color: 'geekblue',
  // label gak di masukin default biar ambil dari nama tag dari obj nya aja
};

const getTagConfig = (tag) => {
  const normalizedTag = tag.toLowerCase();
  return (
    TAG_CONFIGS[normalizedTag] || {
      ...DEFAULT_CONFIG, //default kalo color gak  ada di list TAG_CONFIGS
    }
  );
};

const renderTags = (_, { tags }) => {
  const normalizedTags = (Array.isArray(tags) ? tags : [tags || '']).filter(
    (tag) => Boolean(tag?.toString().trim()),
  );

  if (normalizedTags.length === 0) return null;

  return (
    <>
      {normalizedTags.map((originalTag) => {
        const tag = originalTag.toString().trim();
        const { color, label } = getTagConfig(tag);
        const displayText = label || tag.toUpperCase();

        return (
          <Tag key={`${tag}`} color={color} bordered={false}>
            {displayText}
          </Tag>
        );
      })}
    </>
  );
};

export default renderTags;
