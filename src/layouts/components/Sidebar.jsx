import { HiOutlineCalendar, HiOutlinePlus, HiUsers } from 'react-icons/hi';
import { TbClipboardList, TbLayout2 } from 'react-icons/tb';
import { MenuList, styled } from '@mui/material';
import { Logo } from 'components';
import SubHeader from './SubHeader';
import SidebarItem from './SidebarItem';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';

const sidebarMembership = [{ name: 'Trang chủ', icon: <TbLayout2 />, to: '/' }];

const SidebarContainer = styled('aside')(({ theme }) => ({
  width: '17rem',
  background: 'white',
}));

export const Sidebar = () => {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);
  let user = useSelector((state) => state.auth.auth?.user);

  return (
    <SidebarContainer>
      <Logo sx={{ p: 6 }} />
      <MenuList sx={{ gap: 1.5, pt: 8 }}>
        {sidebarMembership.map((item, index) =>
          item.children ? (
            <SubHeader item={item} key={index} active={active} onActive={setActive} />
          ) : (
            <SidebarItem item={item} key={index} active={active} onActive={setActive} />
          )
        )}
      </MenuList>
    </SidebarContainer>
  );
};
