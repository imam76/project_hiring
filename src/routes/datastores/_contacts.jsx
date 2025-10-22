import Api from '@/utils/axios/api';
import ReactLazyWithSuspense from '@/utils/reactLazyWithSuspense';
import { redirect } from 'react-router';

/** @type {import('react-router').RouteObject[]} */
const routes = [
  {
    path: 'contacts',
    children: [
      {
        index: true,
        loader: () => redirect('/datastores/contacts/list'),
      },
      {
        path: 'list',
        element: ReactLazyWithSuspense(
          async () =>
            await import('@/pages/datastores/contacts/content-contacts'),
        ),
        children: [
          {
            path: 'filter',
            element: ReactLazyWithSuspense(
              async () =>
                await import('@/pages/datastores/contacts/filter-contact'),
            ),
          },
        ],
      },
      {
        path: 'create',
        element: ReactLazyWithSuspense(
          async () =>
            await import('@/pages/datastores/contacts/create-contact'),
        ),
      },
      {
        path: 'edit/:id',
        element: ReactLazyWithSuspense(
          async () => await import('@/pages/datastores/contacts/edit-contact'),
        ),
      },
      {
        path: 'detail/:id',
        element: ReactLazyWithSuspense(
          async () =>
            await import('@/pages/datastores/contacts/detail-contact'),
        ),
      },
      {
        path: 'delete/:id',
        action: async ({ params }) => {
          const { id } = params;
          try {
            const res = await Api().delete(`/api/v1/contacts/${id}`);
            return res;
          } catch (error) {
            console.error('Error deleting contact:', error);
          }
        },
      },
      {
        path: '*',
        element: ReactLazyWithSuspense(() => import('@/pages/notfound')),
      },
    ],
  },
];

export default routes;
