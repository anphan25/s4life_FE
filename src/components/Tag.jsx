import { styled } from '@mui/material';
import React from 'react';

const TagStyle = styled('span')(({ theme, styleState }) => {
  return {
    lineHeight: 1,
    borderRadius: 8,
    cursor: 'default',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    justifyContent: 'center',
    padding: '6px 8px',
    color: theme.palette.grey[900],
    fontSize: 12,
    backgroundColor: theme.palette.grey[300],
    fontWeight: 700,

    ...(styleState.status === 'success' && {
      color: theme.palette.success.main,
      backgroundColor: theme.palette.success.light,
    }),
    ...(styleState.status === 'error' && {
      color: theme.palette.error.main,
      backgroundColor: theme.palette.error.light,
    }),
    ...(styleState.status === 'warning' && {
      color: theme.palette.warning.main,
      backgroundColor: theme.palette.warning.light,
    }),
    ...(styleState.status === 'info' && {
      color: theme.palette.info.main,
      backgroundColor: theme.palette.info.light,
    }),
  };
});

export const Tag = ({ status = 'default', children, ...props }) => {
  return (
    <TagStyle styleState={{ status }} {...props}>
      {children}
    </TagStyle>
  );
};
