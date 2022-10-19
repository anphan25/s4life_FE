import React from 'react';
import { Alert, styled, Typography, Grid } from '@mui/material';
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
  '@media screen and (max-width: 1200px)': {
    width: '880px',
    height: '551px',
    //do Smth
  },
  '@media screen and (max-width: 320px) and (max-height: 878px)': {
    flexDirection: 'column',
    width: '290px',
    height: '819px',
    //do Smth
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
  '@media screen and (max-width: 1200px)': {
    height: '551px',
  },
  '@media screen and (max-width: 320px) and (max-height: 878px)': {
    width: '290px',
    height: '381px',
    //do Smth
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
    '@media screen and (max-width: 320px) and (max-height: 878px)': {
      marginTop: '40px',
      marginBottom: '40px',

      //do Smth
    },
  },

  '@media screen and (max-width: 1200px)': {
    height: '551px',
  },
  '@media screen and (max-width: 320px) and (max-height: 878px)': {
    width: '290px',
    height: '438px',
    paddingLeft: '15px',
    paddingRight: '15px',
    //do Smth
  },
}));

const DivLogo = styled('div')(({ theme }) => ({
  width: '375px',
  height: '375px',
  marginTop: '86px',
  marginLeft: '95px',
  '@media screen and (max-width: 1200px)': {
    width: '200px',
    height: '200px',
    //do Smth
  },
  '@media screen and (max-width: 320px) and (max-height: 878px)': {
    flexDirection: 'column',
    width: '260px',
    height: '260px',
    marginTop: '15px',
    marginLeft: '15px',
    //do Smth
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
