import ReactLazyWithSuspense from '@/utils/reactLazyWithSuspense';

/** @type {import('react-router').RouteObject[]} */
const routes = [
  {
    path: 'jobs',
    element: ReactLazyWithSuspense(
      async () => await import('@/pages/jobs/jobs'),
    ),
  },
  {
    path: 'jobs/:jobId/applications',
    element: ReactLazyWithSuspense(
      async () => await import('@/pages/jobs/JobApplicationsManage'),
    ),
  },
];

export default routes;
