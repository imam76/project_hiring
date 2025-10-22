import ReactLazyWithSuspense from '@/utils/reactLazyWithSuspense';

/** @type {import('react-router').RouteObject[]} */
const routes = [
  {
    path: 'reports',
    children: [
      {
        index: true,
        element: ReactLazyWithSuspense(
          async () => await import('@/pages/reports/reports'),
        ),
      },
      {
        path: 'profit-loss',
        element: ReactLazyWithSuspense(
          async () => await import('@/pages/reports/profit-loss'),
        ),
      },
    ],
  },
];

export default routes;
