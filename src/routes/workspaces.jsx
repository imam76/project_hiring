import ReactLazyWithSuspense from '@/utils/reactLazyWithSuspense';

/** @type {import('react-router').RouteObject[]} */
const routes = [
  {
    path: 'workspaces',
    element: ReactLazyWithSuspense(
      async () => await import('@/pages/workspaces/workspaces'),
    ),
  },
];

export default routes;
