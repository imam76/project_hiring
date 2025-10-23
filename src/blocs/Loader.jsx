import { Spin } from 'antd';

const Loader = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Spin size="large" />
    </div>
  );
};

export default Loader;
