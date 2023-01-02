import React from 'react';
import myIcons from 'config/selection.json';
import IcomoonReact from 'icomoon-react';
import { SvgIcon } from '@mui/material';

export const Icon = ({ icon, ...props }) => {
  return (
    <SvgIcon {...props}>
      <IcomoonReact iconSet={myIcons} icon={icon} />
    </SvgIcon>
  );
};
