import { Box, Button, Grid, MenuItem, Select, Stack, Typography } from '@mui/material';
import { HeaderBreadcumbs, Icon } from 'components';
import React, { useState } from 'react';
import ResultItem from 'pages/script/components/result-item/ResultItem';
import { HeaderMainStyle, ResultContainer, RunContainer } from './RunScriptStyle';
import { auth } from 'config';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import { listVolunteerAccount, registerEvent, loginOTP } from './Script';
import { convertErrorCodeToMessage } from 'utils';
import { HubConnectionBuilder } from '@microsoft/signalr';

const categoryList = [
  {
    name: 'Đăng ký sự kiện',
    value: 0,
  },
  {
    name: 'Xác nhận hiến máu',
    value: 1,
  },
  {
    name: 'Cập nhật nhóm máu',
    value: 2,
  },
];

const generateRecaptchaVerifier = () => {
  window.recaptchaVerifier = new RecaptchaVerifier(
    'sign-in-button',
    {
      size: 'invisible',
    },
    auth
  );
};

const RunScriptPage = () => {
  const event = {
    eventId: 'f0506e41-f1d8-4aac-82e6-0cefd0cb1e4e',
    participationDate: new Date().toISOString(),
    eventCode: 'FPT0012',
    eventName: 'Hiến máu tháng 2',
  };
  const [category, setCategory] = useState('');
  const [run, setRun] = useState([]);
  const [result, setResult] = useState([]);

  const openHubConnection = async (token, result) => {
    const hubConnection = new HubConnectionBuilder()
      .withUrl(process.env.REACT_APP_SIGNALR_URL, {
        accessTokenFactory: () => {
          return token;
        },
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    try {
      await hubConnection.start();
      hubConnection.off('ReceiveMessage');
      hubConnection.on('ReceiveMessage', (messageCode) => {
        console.log('messageCode', messageCode);
        setResult((prevState) => [
          ...prevState,
          {
            event: event,
            message: convertErrorCodeToMessage(messageCode),
            type: messageCode !== 7100 ? 'error' : 'success',
            username: result.user.phoneNumber,
          },
        ]);
      });
      //await hubConnection.stop();
    } catch (error) {
      console.log(error);
    }

    //await hubConnection.stop();
  };

  function volunteerRegisterEvent() {
    listVolunteerAccount.forEach((e, index) => {
      if (!window.recaptchaVerifier) {
        generateRecaptchaVerifier();
      }
      var appVerifier = window.recaptchaVerifier;
      signInWithPhoneNumber(auth, e, appVerifier)
        .then((confirmationResult) => {
          return confirmationResult.confirm('000000').then((result) => {
            setRun((prevState) => [
              ...prevState,
              {
                action: 'Đăng nhập',
                username: result.user.phoneNumber,
              },
              {
                action: 'Đăng ký sự kiện',
                username: result.user.phoneNumber,
              },
            ]);
            result.user.getIdToken().then((idToken) => {
              loginOTP({
                idToken,
              }).then(async (res) => {
                registerEvent(
                  { eventId: event.eventId, participationDate: event.participationDate, eventCode: event.eventCode },
                  res.accessToken
                );
                openHubConnection(res.accessToken, result);
                signOut(auth);
              });
            });
          });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  async function runScript() {
    switch (category) {
      case 0:
        volunteerRegisterEvent();
        break;

      case 1:
        break;

      case 2:
        break;

      default:
        break;
    }
  }

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs heading="Giả lập" links={[{ name: 'Trang chủ', to: '/' }, { name: 'Giả lập' }]} />
        <Stack direction={'row'} gap="12px">
          <Select
            renderValue={(selected) => {
              if (selected.length === 0) {
                return 'Chọn loại giả lập';
              }
              return categoryList[selected].name;
            }}
            sx={{ minWidth: 200 }}
            name={'category'}
            select={'true'}
            value={category}
            onChange={handleCategoryChange}
            displayEmpty
          >
            <MenuItem
              disabled
              value=""
              sx={{ backgroundColor: 'white !important', mb: 1, pl: 0, fontSize: 12, fontWeight: 'bold' }}
            >
              Chọn loại giả lập
            </MenuItem>
            {categoryList.map((category) => (
              <MenuItem sx={{ cursor: 'pointer', mb: 1, px: 3, py: 1.5 }} key={category.name} value={category.value}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
          <Button
            id="sign-in-button"
            sx={{ whiteSpace: 'nowrap' }}
            startIcon={<Icon icon="solid-play" />}
            variant="contained"
            onClick={runScript}
          >
            Chạy giả lập
          </Button>
        </Stack>
      </HeaderMainStyle>
      <Grid container spacing={2}>
        <Grid item md={5} sm={6} xs={12}>
          <RunContainer>
            <Stack direction={'column'} gap="12px" sx={{ overflow: 'auto' }}>
              {run.length > 0 &&
                run.map((item, index) => (
                  <div key={index}>
                    <Typography>{++index}</Typography>
                    <Typography>
                      [{item.action}] {item.username}
                    </Typography>
                  </div>
                ))}
            </Stack>
          </RunContainer>
        </Grid>
        <Grid item md={7} sm={6} xs={12}>
          <ResultContainer>
            <Box sx={{ height: 'auto' }}></Box>
            <Stack direction={'column'} gap="12px" sx={{ overflow: 'auto', padding: '20px 30px 30px' }}>
              {result.length > 0 && result.map((item, index) => <ResultItem item={item} index={index} key={index} />)}
            </Stack>
          </ResultContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default RunScriptPage;
