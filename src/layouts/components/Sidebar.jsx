import { Drawer, IconButton, MenuList, Stack, styled, Typography } from '@mui/material';
import { Icon, Logo } from 'components';
import SubHeader from './SubHeader';
import SidebarItem from './SidebarItem';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import useResponsive from 'hooks/useResponsive';

const SidebarContainer = styled('aside')(({ theme }) => ({
  width: '280px',
  background: 'white',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRight: `1px solid ${theme.palette.grey[300]}`,
  overflowY: 'auto',
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  padding: '4px',
  top: 32,
  left: 268,
  border: `1px solid ${theme.palette.grey[300]}`,
  backgroundColor: 'white',
}));

export const Sidebar = ({ toggle, onClose }) => {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);
  let user = useSelector((state) => state?.auth.auth?.user);
  const isDesktop = useResponsive('up', 'lg');

  const sidebarAdmin = [
    { name: 'Trang chủ', icon: <Icon icon="grid-web-7" />, to: '/' },
    { name: 'Quản lý bệnh viện', icon: <Icon icon="hospital" />, to: '/hospital/list' },
    {
      name: 'Quản lý sự kiện',
      icon: <Icon icon="coupon-star" />,
      children: [
        {
          name: 'Cố định',
          to: '/event/fixed-list/',
        },
        {
          name: 'Lưu động',
          to: '/event/mobile-list',
        },
      ],
    },
    {
      name: 'Quản lý tài khoản',
      icon: <Icon icon="users" />,
      to: '/user/list',
    },

    {
      name: 'Thống kê',
      icon: <Icon icon="chart-pie" />,
      to: '/statistics',
    },
  ];

  const sidebarModerator = [
    { name: 'Trang chủ', icon: <Icon icon="grid-web-7" />, to: '/' },
    {
      name: 'Quản lý sự kiện',
      icon: <Icon icon="coupon-star" />,
      children: [
        {
          name: 'Cố định',
          to: '/event/fixed-list/',
        },

        {
          name: 'Lưu động',
          to: '/event/mobile-list',
        },
      ],
    },
    {
      name: 'Danh sách tình nguyện viên',
      icon: <Icon icon="users" />,
      to: '/user/list',
    },
    {
      name: 'Xét duyệt lịch sử hiến máu',
      icon: <Icon icon="file-text-edit" />,
      to: '/blood-donation-approval-request/list',
    },
  ];

  const sidebarManager = [
    { name: 'Trang chủ', icon: <Icon icon="grid-web-7" />, to: '/' },
    {
      name: 'Quản lý sự kiện',
      icon: <Icon icon="coupon-star" />,
      children: [
        {
          name: 'Cố định',
          to: '/event/fixed-list/',
        },

        {
          name: 'Lưu động',
          to: '/event/mobile-list',
        },
        {
          name: 'Lưu động dự kiến',
          to: '/event/intended-list/',
        },
        {
          name: 'Theo lịch bệnh viện',
          to: '/event/schedule-list/',
        },
      ],
    },
    { name: 'Thông tin bệnh viện', icon: <Icon icon="hospital" />, to: `/hospital/${user?.hospital_id}` },
    {
      name: 'Thống kê',
      icon: <Icon icon="chart-pie" />,
      to: '/statistics',
    },
  ];

  const sidebarEmployee = [
    { name: 'Trang chủ', icon: <Icon icon="grid-web-7" />, to: '/' },
    {
      name: 'Quản lý sự kiện',
      icon: <Icon icon="coupon-star" />,
      children: [
        {
          name: 'Cố định',
          to: '/event/fixed-list/',
        },
        {
          name: 'Lưu động',
          to: '/event/mobile-list',
        },
        {
          name: 'Lưu động dự kiến',
          to: '/event/intended-list/',
        },
        {
          name: 'Theo lịch bệnh viện',
          to: '/event/schedule-list/',
        },
      ],
    },
    { name: 'Thông tin bệnh viện', icon: <Icon icon="hospital" />, to: `/hospital/${user?.hospital_id}` },
  ];

  const renderContent = (
    <>
      <Stack direction={'row'} sx={{ padding: '24px 16px', width: '100%' }} alignItems={'center'}>
        <Logo sx={{ height: 65 }} />
        <Typography sx={{ fontWeight: 700, fontSize: 24 }}>S4Life</Typography>
      </Stack>
      <MenuList sx={{ gap: '10px', width: '100%', display: 'flex', flexDirection: 'column' }}>
        {user?.role === 'Admin' &&
          sidebarAdmin.map((item, index) =>
            item.children ? (
              <SubHeader item={item} key={index} active={active} onActive={setActive} />
            ) : (
              <SidebarItem item={item} key={index} active={active} onActive={setActive} />
            )
          )}

        {user?.role === 'Moderator' &&
          sidebarModerator.map((item, index) =>
            item.children ? (
              <SubHeader item={item} key={index} active={active} onActive={setActive} />
            ) : (
              <SidebarItem item={item} key={index} active={active} onActive={setActive} />
            )
          )}

        {user?.role === 'Manager' &&
          sidebarManager.map((item, index) =>
            item.children ? (
              <SubHeader item={item} key={index} active={active} onActive={setActive} />
            ) : (
              <SidebarItem item={item} key={index} active={active} onActive={setActive} />
            )
          )}

        {user?.role === 'Employee' &&
          sidebarEmployee.map((item, index) =>
            item.children ? (
              <SubHeader item={item} key={index} active={active} onActive={setActive} />
            ) : (
              <SidebarItem item={item} key={index} active={active} onActive={setActive} />
            )
          )}
      </MenuList>
    </>
  );

  return (
    <>
      {!isDesktop && (
        <Drawer open={toggle} onClose={onClose} PaperProps={{ sx: { width: '280px' } }}>
          <IconButton color="error" sx={{ m: 1, width: 'fit-content' }} onClick={onClose}>
            <Icon icon="times" size={20} />
          </IconButton>
          {renderContent}
        </Drawer>
      )}
      {isDesktop && (
        <SidebarContainer>
          {/* <ToggleButton size="small">
            <Icon icon="solid-angles-left-small" sx={{ fontSize: 16 }} />
          </ToggleButton> */}
          {renderContent}
        </SidebarContainer>
      )}
    </>
  );
};
