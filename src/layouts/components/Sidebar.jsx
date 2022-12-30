import { Drawer, IconButton, MenuList, styled } from '@mui/material';
import { Icon, Logo } from 'components';
import SubHeader from './SubHeader';
import SidebarItem from './SidebarItem';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import useResponsive from 'hooks/useResponsive';

const sidebarAdmin = [
  { name: 'Trang chủ', icon: <Icon icon="solid-grid-web-7" />, to: '/' },
  { name: 'Quản lý bệnh viện', icon: <Icon icon="solid-hospital" />, to: '/hospital/list' },
  {
    name: 'Quản lý sự kiện',
    icon: <Icon icon="solid-coupon-star" />,
    children: [
      {
        name: 'Cố định',
        to: '/event/list/',
      },
      {
        name: 'Lưu động',
        // to: '/recipes/drinks',
      },
    ],
  },
  {
    name: 'Quản lý người dùng',
    icon: <Icon icon="solid-users" />,
    to: '/user/list',
  },
];

const sidebarManager = [
  { name: 'Trang chủ', icon: <Icon icon="solid-grid-web-7" />, to: '/' },
  {
    name: 'Quản lý sự kiện',
    icon: <Icon icon="solid-coupon-star" />,
    children: [
      {
        name: 'Cố định',
        to: '/event/list/',
      },
      {
        name: 'Lưu động',
        // to: '/recipes/drinks',
      },
      {
        name: 'Theo lịch bệnh viện',
        // to: '/recipes/drinks',
      },
    ],
  },
  { name: 'Thông tin bệnh viện', icon: <FaRegHospital />, to: '/hospital/info' },
];

const SidebarContainer = styled('aside')(({ theme }) => ({
  width: '250px',
  background: 'white',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export const Sidebar = ({ toggle, onClose }) => {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);
  let user = useSelector((state) => state.auth.auth?.user);
  const isDesktop = useResponsive('up', 'lg');

  const renderContent = (
    <>
      <Logo sx={{ margin: '40px auto' }} />
      <MenuList sx={{ gap: 2, width: '100%' }}>
        {user?.role === 'Admin' &&
          sidebarAdmin.map((item, index) =>
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
      </MenuList>
    </>
  );

  return (
    <>
      {!isDesktop && (
        <Drawer open={toggle} onClose={onClose} PaperProps={{ sx: { width: '250px' } }}>
          <IconButton color="error" sx={{ m: 1, width: 'fit-content' }} onClick={onClose}>
            <Icon icon="times" size={20} />
          </IconButton>
          {renderContent}
        </Drawer>
      )}
      {isDesktop && <SidebarContainer>{renderContent}</SidebarContainer>}
    </>
  );
};
