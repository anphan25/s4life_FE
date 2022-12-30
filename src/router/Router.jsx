import { DashboardLayout, ErrorLayout } from 'layouts';
import { Navigate, useRoutes } from 'react-router-dom';
import AuthRouter from './AuthRouter';
import { Loading } from 'components';
import { Suspense, lazy } from 'react';
import { ProtectedRouter } from './ProtectedRouter';

const Loadable = (Component) => (props) => {
  return (
    <Suspense fallback={<Loading />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: 'login',
      element: <LoginPage />,
      index: true,
    },
    {
      path: '/',
      element: (
        <AuthRouter>
          <DashboardLayout />
        </AuthRouter>
      ),
      children: [
        {
          element: (
            <ProtectedRouter roles={['Manager', 'Admin', 'Staff']}>
              <DashboardPage />
            </ProtectedRouter>
          ),
          index: true,
        },
        {
          path: 'account',
          children: [
            {
              index: true,
              element: (
                <ProtectedRouter roles={['Admin', 'Staff', 'Manager']}>
                  <AccountPage />
                </ProtectedRouter>
              ),
            },
          ],
        },
        {
          path: 'event',
          children: [
            { element: <Navigate to="/event/list" replace />, index: true },
            {
              path: 'list',
              element: (
                <ProtectedRouter roles={['Manager', 'Staff', 'Admin']}>
                  <EventListPage />
                </ProtectedRouter>
              ),
            },
            {
              path: 'add',
              element: (
                <ProtectedRouter roles={['Manager']}>
                  <AddEditEventPage />
                </ProtectedRouter>
              ),
            },
            {
              path: ':eventId',
              element: (
                <ProtectedRouter roles={['Manager', 'Staff', 'Admin']}>
                  <EventDetailPage />
                </ProtectedRouter>
              ),
            },
            {
              path: ':eventId/edit',
              element: (
                <ProtectedRouter roles={['Manager']}>
                  <AddEditEventPage />
                </ProtectedRouter>
              ),
            },
          ],
        },
        {
          path: 'statistics',
          element: (
            <ProtectedRouter roles={['Manager', 'Admin', 'Staff']}>
              <StatisticsPage />
            </ProtectedRouter>
          ),
        },
        {
          path: 'user',
          children: [
            { element: <Navigate to="/user/list" replace />, index: true },
            {
              path: 'list',
              element: (
                <ProtectedRouter roles={['Admin']}>
                  <UserListPage />
                </ProtectedRouter>
              ),
            },
            {
              path: 'add',
              element: (
                <ProtectedRouter roles={['Admin']}>
                  <AddEditUserPage />
                </ProtectedRouter>
              ),
            },
            {
              path: ':userId',
              element: (
                <ProtectedRouter roles={['Manager', 'Admin', 'Staff']}>
                  <UserDetailPage />
                </ProtectedRouter>
              ),
            },
            {
              path: ':eventId/edit',
              element: (
                <ProtectedRouter roles={['Admin']}>
                  <AddEditUserPage />
                </ProtectedRouter>
              ),
            },
          ],
        },

        {
          path: 'hospital',
          children: [
            { element: <Navigate to="/hospital/list" replace />, index: true },
            {
              path: 'list',
              element: (
                <ProtectedRouter roles={['Admin']}>
                  <HospitalListPage />
                </ProtectedRouter>
              ),
            },
            {
              path: 'info',
              element: (
                <ProtectedRouter roles={['Manager']}>
                  <HospitalInfoPage />
                </ProtectedRouter>
              ),
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <ErrorLayout />,
      children: [
        { path: 'permission-denied', element: <PermissionDeniedPage /> },
        { path: 'not-found', element: <NotFoundPage /> },
        { path: '*', element: <Navigate to="/not-found" replace /> },
      ],
    },
  ]);
}

//account
const AccountPage = Loadable(lazy(() => import('pages/account/AccountPage')));

//auth
const LoginPage = Loadable(lazy(() => import('pages/auth/LoginPage')));

//dashboard
const DashboardPage = Loadable(lazy(() => import('pages/dashboard/DashboardPage')));

//event
const EventListPage = Loadable(lazy(() => import('pages/event/EventListPage')));
const AddEditEventPage = Loadable(lazy(() => import('pages/event/AddEditEventPage')));
const EventDetailPage = Loadable(lazy(() => import('pages/event/EventDetailPage')));

//error
const PermissionDeniedPage = Loadable(lazy(() => import('pages/error/PermissionDeniedPage')));
const NotFoundPage = Loadable(lazy(() => import('pages/error/NotFoundPage')));

//statistics
const StatisticsPage = Loadable(lazy(() => import('pages/statistics/StatisticsPage')));

//user
const UserListPage = Loadable(lazy(() => import('pages/user/UserListPage')));
const AddEditUserPage = Loadable(lazy(() => import('pages/user/AddEditUserPage')));
const UserDetailPage = Loadable(lazy(() => import('pages/user/UserDetailPage')));

//hospital
const HospitalListPage = Loadable(lazy(() => import('pages/hospital/HospitalListPage')));
const HospitalInfoPage = Loadable(lazy(() => import('pages/hospital/HospitalInfoPage')));
