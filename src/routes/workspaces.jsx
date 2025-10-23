import ReactLazyWithSuspense from '@/utils/reactLazyWithSuspense';

/** @type {import('react-router').RouteObject[]} */
const routes = [
  {
    path: 'workspaces',
    element: ReactLazyWithSuspense(
      async () => await import('@/pages/workspaces/workspaces'),
    ),
  },
  {
    path: 'jobs',
    element: ReactLazyWithSuspense(
      async () => await import('@/pages/workspaces/jobs/jobs'),
    ),
  },
  {
    path: 'jobs/:jobId/applications',
    element: ReactLazyWithSuspense(
      async () => await import('@/pages/workspaces/jobs/JobApplicationsManage'),
    ),
  },
];

export default routes;
