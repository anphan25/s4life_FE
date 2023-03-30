import { styled } from '@mui/material';
import React from 'react';
import { EventRegistrationStatusEnum } from 'utils';

const TagStyle = styled('span')(({ theme, statusId }) => {
  return {
    lineHeight: 1,
    borderRadius: 8,
    cursor: 'default',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    justifyContent: 'center',
    padding: '8px 10px',
    color: theme.palette.grey[900],
    fontSize: 12,
    backgroundColor: theme.palette.grey[300],
    fontWeight: 700,

    ...(statusId === EventRegistrationStatusEnum.Cancelled.value && {
      color: theme.status.cancelled.main,
      backgroundColor: theme.status.cancelled.light,
    }),
    ...(statusId === EventRegistrationStatusEnum.Registered.value && {
      color: theme.status.registered.main,
      backgroundColor: theme.status.registered.light,
    }),
    ...(statusId === EventRegistrationStatusEnum.Donated.value && {
      color: theme.status.donated.main,
      backgroundColor: theme.status.donated.light,
    }),
    ...(statusId === EventRegistrationStatusEnum.ConditionInsufficient.value && {
      color: theme.status.conditionInsufficient.main,
      backgroundColor: theme.status.conditionInsufficient.light,
    }),
    ...(statusId === EventRegistrationStatusEnum.Present.value && {
      color: theme.status.present.main,
      backgroundColor: theme.status.present.light,
    }),
    ...(statusId === EventRegistrationStatusEnum.Discarded.value && {
      color: theme.status.discarded.main,
      backgroundColor: theme.status.discarded.light,
    }),
    ...(statusId === EventRegistrationStatusEnum.Missed.value && {
      color: theme.status.missed.main,
      backgroundColor: theme.status.missed.light,
    }),
  };
});

export const RegistrationStatusTag = ({ status = 'default', children, ...props }) => {
  return (
    <TagStyle statusId={status} {...props}>
      {children}
    </TagStyle>
  );
};
