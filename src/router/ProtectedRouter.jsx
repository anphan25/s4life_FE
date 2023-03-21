import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const ProtectedRouter = ({ children, roles }) => {
  const { role } = useSelector((state) => state.auth.auth.user);

  const canAccess = roles?.includes(role);

  if (!canAccess) {
    return <Navigate to="/permission-denied" />;
  }

  return children;
};
