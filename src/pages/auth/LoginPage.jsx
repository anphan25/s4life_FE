import React from 'react';
import { styled, Typography } from '@mui/material';
import { Logo as logo } from 'assets';
import LoginForm from './components/LoginForm';

const DivContainner = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5F8FA',
}));
const DivContent = styled('div')(({ theme }) => ({
  backgroundColor: 'white',
  width: '1180px',
  height: '651px',
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'center',
  borderRadius: '16px',

  [theme.breakpoints.down('lg')]: {
    justifyContent: 'center',
    display: 'flex',
  },
  [theme.breakpoints.between('sm', 'md')]: {
    justifyContent: 'center',
    width: '700px',
    height: '551px',
  },

  [theme.breakpoints.between('xs', 'sm')]: {
    flexDirection: 'column',
    margin: '0 auto !important',
    width: '100%',
    height: '819px',
  },
}));
const DivLeft = styled('div')(({ theme }) => ({
  width: '565px',
  height: '651px',
  backgroundColor: '#F1F1F5',
  borderTopLeftRadius: '16px',
  borderBottomLeftRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('lg')]: {
    justifyContent: 'center',
  },
  [theme.breakpoints.between('sm', 'md')]: {
    height: '551px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: '0px',
    borderBottomLeftRadius: '0px',
  },

  [theme.breakpoints.between('xs', 'sm')]: {
    width: '100%',
    height: '381px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: '0px',
    borderBottomLeftRadius: '0px',
  },
}));

const DivRight = styled('div')(({ theme }) => ({
  width: '615px',
  height: '651px',
  borderBottomRightRadius: '16px',
  borderTopRightRadius: '16px',
  backgroundColor: 'white',
  paddingLeft: '60px',
  paddingRight: '90px',
  '& .header': {
    color: '#171725',
    marginTop: '106px',
    marginBottom: '36px',
  },
  [theme.breakpoints.down('lg')]: {
    justifyContent: 'center',
  },
  [theme.breakpoints.between('sm', 'md')]: {
    height: '551px',
  },

  [theme.breakpoints.between('xs', 'sm')]: {
    width: '100%',
    height: '438px',
    paddingLeft: '15px',
    paddingRight: '15px',
  },
}));

const DivLogo = styled('div')(({ theme }) => ({
  width: '375px',
  height: '375px',
  marginTop: '86px',
  marginLeft: '95px',
  [theme.breakpoints.down('lg')]: {
    justifyContent: 'center',
  },
  [theme.breakpoints.between('sm', 'md')]: {
    width: '200px',
    height: '200px',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '0px',
    display: 'flex',
  },

  [theme.breakpoints.between('xs', 'sm')]: {
    flexDirection: 'column',
    width: '260px',
    height: '260px',
    marginTop: '15px',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '0px',
    display: 'flex',
  },
}));
const DivSlogan = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  width: '100%',
  height: '277px',
  '& .slogan': {
    color: theme.palette.primary.main,
  },
  '& .slogan2': {
    marginTop: '21px',
    color: '#92929D',
  },
}));

const LoginPage = () => {
  return (
    <DivContainner>
      <DivContent>
        <DivLeft>
          <DivLogo>
            <img src={logo} alt="" width="100%" height="100%" />
          </DivLogo>
          <DivSlogan>
            <Typography variant="h3" className="slogan">
              Hiến máu nhân đạo
            </Typography>
            <Typography variant="h5" className="slogan2">
              Giọt máu cho đi cuộc đời ở lại
            </Typography>
          </DivSlogan>
        </DivLeft>
        <DivRight>
          <Typography variant="h3" className="header">
            Đăng nhập
          </Typography>
          <LoginForm />
        </DivRight>
      </DivContent>
    </DivContainner>
  );
};

export default LoginPage;
