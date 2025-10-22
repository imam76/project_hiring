import { useNavigate } from 'react-router';
import { useLocation } from 'react-router';

const navigateToChildRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigateToChild = ({ childrenPath }) => {
    const currentPath = location.pathname.replace(/\/$/, ''); // hapus trailing slash
    const child = childrenPath.replace(/^\//, ''); // hapus leading slash
    navigate(`${currentPath}/${child}`);
  };

  return navigateToChild;
};

export default navigateToChildRoute;
