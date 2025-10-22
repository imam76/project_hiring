import ReactLazyWithSuspense from '@/utils/reactLazyWithSuspense';
import { redirect } from 'react-router';

/** @type {import('react-router').RouteObject[]} */
const routes = [
  {
    path: 'financial-statement',
    children: [
      {
        index: true,
        loader: () => redirect('/reports/financial-statement/list'),
      },
      {
        path: 'list',
        element: ReactLazyWithSuspense(
          async () =>
            await import(
              '@/pages/reports/financial-statement/financial-statement'
            ),
        ),
      },
      {
        path: 'cash-flow',
        element: ReactLazyWithSuspense(
          async () =>
            await import('@/pages/reports/financial-statement/cash-flow'),
        ),
      },
      {
        path: 'filter-profit-loss',
        element: ReactLazyWithSuspense(
          async () =>
            await import(
              '@/pages/reports/financial-statement/profit-loss/filter-report-profit-loss'
            ),
        ),
      },
      {
        path: 'profit-loss',
        element: ReactLazyWithSuspense(
          async () =>
            await import(
              '@/pages/reports/financial-statement/profit-loss/report-profit-loss'
            ),
        ),
      },
      {
        path: 'balance-sheet',
        element: ReactLazyWithSuspense(
          async () =>
            await import('@/pages/reports/financial-statement/balance-sheet'),
        ),
      },
      {
        path: '*',
        element: ReactLazyWithSuspense(() => import('@/pages/notfound')),
      },
    ],
  },
];

export default routes;
