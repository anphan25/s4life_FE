import React from 'react';
import myIcons from 'config/selection.json';
import IcomoonReact from 'icomoon-react';
import { SvgIcon } from '@mui/material';

export const Icon = ({ color, icon, ...props }) => {
  return (
    <SvgIcon {...props}>
      <IcomoonReact iconSet={myIcons} color={color} icon={icon} />
    </SvgIcon>
  );
};
