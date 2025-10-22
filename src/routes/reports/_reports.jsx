import ReactLazyWithSuspense from '@/utils/reactLazyWithSuspense';
import financialStatement from './_financial-statement';

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
      ...financialStatement,
      {
        path: '*',
        element: ReactLazyWithSuspense(() => import('@/pages/notfound')),
      },
    ],
  },
];

export default routes;
