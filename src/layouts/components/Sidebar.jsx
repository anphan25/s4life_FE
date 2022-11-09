import { FaRegHospital } from 'react-icons/fa';
import { TbLayout2 } from 'react-icons/tb';
import { MdOutlineEventNote } from 'react-icons/md';
import { HiX } from 'react-icons/hi';
import { Drawer, IconButton, MenuList, styled } from '@mui/material';
import { Logo } from 'components';
import SubHeader from './SubHeader';
import SidebarItem from './SidebarItem';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import useResponsive from 'hooks/useResponsive';

const sidebarAdmin = [
  { name: 'Trang chủ', icon: <TbLayout2 />, to: '/' },
  { name: 'Quản lý bệnh viện', icon: <FaRegHospital />, to: '/hospital/list' },
  {
    name: 'Quản lý sự kiện',
    icon: <MdOutlineEventNote />,
    children: [
      {
        name: 'Cố định',
        to: '/event/list/',
      },
      {
        name: 'Lưu động',
        to: '/recipes/drinks',
      },
    ],
  },
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
  //let user = useSelector((state) => state.auth.auth?.user);
  const isDesktop = useResponsive('up', 'lg');

  const renderContent = (
    <>
      <Logo sx={{ margin: '80px 30px 5px 30px' }} />
      <MenuList sx={{ gap: 2, width: '100%' }}>
        {sidebarAdmin.map((item, index) =>
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
          <IconButton color="error" sx={{ m: 1 }} onClick={onClose}>
            <HiX />
          </IconButton>
          {renderContent}
        </Drawer>
      )}
      {isDesktop && <SidebarContainer>{renderContent}</SidebarContainer>}
    </>
  );
};
