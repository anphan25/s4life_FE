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
            <ProtectedRouter roles={['Manager', 'Admin', 'Moderator', 'Employee']}>
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
                <ProtectedRouter roles={['Admin']}>
                  <AccountPage />
                </ProtectedRouter>
              ),
            },
          ],
        },
        {
          path: 'event',
          children: [
            { element: <Navigate to="/event/fixed-list" replace />, index: true },
            {
              path: 'fixed-list',
              children: [
                {
                  index: true,
                  element: (
                    <ProtectedRouter roles={['Manager', 'Admin', 'Employee', 'Moderator']}>
                      <EventFixedListPage />
                    </ProtectedRouter>
                  ),
                },
                {
                  path: 'add',
                  element: (
                    <ProtectedRouter roles={['Manager']}>
                      <AddEditFixedEventPage />
                    </ProtectedRouter>
                  ),
                },
                {
                  path: ':eventId/edit',
                  element: (
                    <ProtectedRouter roles={['Manager']}>
                      <AddEditFixedEventPage />
                    </ProtectedRouter>
                  ),
                },
              ],
            },
            {
              path: 'schedule-list',
              children: [
                {
                  index: true,
                  element: (
                    <ProtectedRouter roles={['Manager', 'Employee']}>
                      <EventHospitalSchedulePage />
                    </ProtectedRouter>
                  ),
                },
              ],
            },
            {
              path: 'mobile-list',
              children: [
                {
                  index: true,
                  element: (
                    <ProtectedRouter roles={['Manager', 'Admin', 'Employee', 'Moderator']}>
                      <EventMobileListPage />
                    </ProtectedRouter>
                  ),
                },
                {
                  path: 'add',
                  element: (
                    <ProtectedRouter roles={['Manager']}>
                      <AddMobileEventPage />
                    </ProtectedRouter>
                  ),
                },
              ],
            },
            {
              path: ':eventId',
              element: (
                <ProtectedRouter roles={['Manager', 'Admin', 'Employee', 'Moderator']}>
                  <EventDetailPage />
                </ProtectedRouter>
              ),
            },
          ],
        },
        {
          path: 'statistics',
          element: (
            <ProtectedRouter roles={['Manager', 'Admin']}>
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
                <ProtectedRouter roles={['Admin', 'Moderator']}>
                  <UserListPage />
                </ProtectedRouter>
              ),
            },
            {
              path: ':userInformationId',
              element: (
                <ProtectedRouter roles={['Admin', 'Moderator']}>
                  <UserDetailPage />
                </ProtectedRouter>
              ),
            },
            {
              path: ':userInformationId/edit',
              element: (
                <ProtectedRouter roles={['Admin']}>
                  <EditUserInformationPage />
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
                <ProtectedRouter roles={['Moderator', 'Admin']}>
                  <HospitalListPage />
                </ProtectedRouter>
              ),
            },
            {
              path: ':hospitalId',
              element: (
                <ProtectedRouter roles={['Employee', 'Moderator', 'Admin', 'Manager']}>
                  <HospitalInfoPage />
                </ProtectedRouter>
              ),
            },
          ],
        },
        {
          path: 'blood-donation-approval-request',
          children: [
            { element: <Navigate to="/blood-donation-approval-request/list" replace />, index: true },
            {
              path: 'list',
              element: (
                <ProtectedRouter roles={['Moderator']}>
                  <ApprovalList />
                </ProtectedRouter>
              ),
            },
            {
              path: ':id',
              element: (
                <ProtectedRouter roles={['Moderator']}>
                  <ApprovalDetail />
                </ProtectedRouter>
              ),
            },
          ],
        },

        {
          path: '/script',
          element: (
            <ProtectedRouter roles={['Admin']}>
              <RunScriptPage />
            </ProtectedRouter>
          ),
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
const EventFixedListPage = Loadable(lazy(() => import('pages/event/event-fixed-list/EventFixedListPage')));
const AddEditFixedEventPage = Loadable(lazy(() => import('pages/event/event-fixed-list/AddEditFixedEventPage')));
const EventDetailPage = Loadable(lazy(() => import('pages/event/components/EventDetailPage')));
const EventHospitalSchedulePage = Loadable(
  lazy(() => import('pages/event/event-hospital-schedule-list/EventHospitalSchedulePage'))
);
const AddMobileEventPage = Loadable(lazy(() => import('pages/event/event-mobile-list/AddMobileEventPage')));
const EventMobileListPage = Loadable(lazy(() => import('pages/event/event-mobile-list/EventMobileListPage')));

//error
const PermissionDeniedPage = Loadable(lazy(() => import('pages/error/PermissionDeniedPage')));
const NotFoundPage = Loadable(lazy(() => import('pages/error/NotFoundPage')));

//statistics
const StatisticsPage = Loadable(lazy(() => import('pages/statistics/StatisticsPage')));

//user
const UserListPage = Loadable(lazy(() => import('pages/user/UserListPage')));
const UserDetailPage = Loadable(lazy(() => import('pages/user/UserDetailPage')));
const EditUserInformationPage = Loadable(lazy(() => import('pages/user/EditUserInformationPage')));

//hospital
const HospitalListPage = Loadable(lazy(() => import('pages/hospital/hospital-list/HospitalListPage')));
const HospitalInfoPage = Loadable(lazy(() => import('pages/hospital/hospital-info/HospitalInfoPage')));

//script
const RunScriptPage = Loadable(lazy(() => import('pages/script/RunScriptPage')));

//blood-donation-approval-request
const ApprovalList = Loadable(lazy(() => import('pages/blood-donation-approval-request/ApprovalListPage')));
const ApprovalDetail = Loadable(lazy(() => import('pages/blood-donation-approval-request/components/ApprovalDetail')));
