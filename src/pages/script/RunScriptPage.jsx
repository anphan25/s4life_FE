import { Box, Button, Grid, MenuItem, Select, Stack, Typography } from '@mui/material';
import { HeaderBreadcumbs, Icon } from 'components';
import React, { useState } from 'react';
import ResultItem from 'pages/script/components/result-item/ResultItem';
import { HeaderMainStyle, ResultContainer, RunContainer } from './RunScriptStyle';
import { auth } from 'config';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import {
  listVolunteerAccount,
  registerEvent,
  loginOTP,
  StaffAccount,
  confirmRegistrationForm,
  editRegistrationForm,
} from './Script';
import { convertErrorCodeToMessage, errorHandler } from 'utils';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { loginUserPassword } from 'api';

const categoryList = [
  {
    name: 'Đăng ký sự kiện',
    value: 0,
  },
  {
    name: 'Xác nhận hiến máu',
    value: 1,
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
    eventId: 'b7e6638b-ce57-47e4-83c3-c60fe4d71745',
    participationDate: new Date('2023-02-15').toISOString(),
    eventCode: '-',
    eventName: 'Nhà Ân',
  };
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
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
      hubConnection.start().then((value) => {
        // hubConnection.off('ReceiveContent');
        hubConnection.on('ReceiveContent', (id, messageCode) => {
          console.log(id, messageCode);
          setResult((prevState) => [
            ...prevState,
            {
              event: event,
              message: convertErrorCodeToMessage(messageCode),
              type: messageCode !== 7100 ? 'error' : 'success',
              username: result.user.phoneNumber,
              eventRegisterId: id,
              action: 'Đăng ký hiến máu',
            },
          ]);
          if (id.length > 0) {
            editRegistrationForm(
              {
                eventRegistrationId: id,
                registrationForm: {
                  isFirstTimeDonating: false,
                  isMalariaInfectedOrHadSurgery: false,
                  isDiseasedBefore: false,
                  isBloodTransfused: false,
                  isVaccinatedAroundOneYear: false,
                  isLosingWeightWithoutCause: false,
                  isHadGanglionRelatedDisease: false,
                  isHadDentalTreatmentOrAcupunctureTreatment: false,
                  isGotTatooedOrPierced: false,
                  isUsingDrugs: false,
                  isHadSexualIntercourseWithHIVInfectedPerson: false,
                  isHadHomoeroticSexualIntercourse: false,
                  isHadBronchitisOrPneumoniaOrRubella: false,
                  isVaccinatedAroundOneMonth: false,
                  isTravelledIntoInfectedZone: false,
                  isHadFluAroundOneWeek: false,
                  isUsingAntibiotic: false,
                  isVaccinatedAroundOneWeek: false,
                  isPregnant: false,
                  isHadAPeriodAroundOneWeek: false,
                  isComfirmedToPerformHIVTest: true,
                },
              },
              token
            ).then((res) => {
              console.log(res);
              setResult((prevState) => [
                ...prevState,
                {
                  event: event,
                  message:
                    res.data.code === 7000 ? 'Điền phiếu đăng ký thành công' : convertErrorCodeToMessage(res.data.code),
                  type: res.data.code !== 7000 ? 'error' : 'success',
                  username: result.user.phoneNumber,
                  eventRegisterId: id,
                  action: 'Điền phiếu đăng ký',
                },
              ]);
            });
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  function volunteerRegisterEvent() {
    listVolunteerAccount.forEach((e, index) => {
      setLoading(true);
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
                action: 'Đăng ký hiến máu',
                username: result.user.phoneNumber,
              },
              {
                action: 'Điền phiếu đăng ký',
                username: result.user.phoneNumber,
              },
            ]);
            result.user.getIdToken().then((idToken) => {
              loginOTP({
                idToken,
              }).then(async (res) => {
                openHubConnection(res.data.result.accessToken, result);
                registerEvent(
                  { eventId: event.eventId, participationDate: event.participationDate, eventCode: event.eventCode },
                  res.data.result.accessToken
                );
                signOut(auth);
              });
            });
          });
        })
        .catch((error) => {
          console.log(error);
        });
      setLoading(false);
    });
  }

  function staffConfirm() {
    setLoading(true);
    try {
      setRun((prevState) => [
        ...prevState,
        {
          action: 'Đăng nhập',
          username: StaffAccount.username,
        },
      ]);
      loginUserPassword(StaffAccount).then((res, index) => {
        result.forEach((e) => {
          if (e.eventRegisterId != null) {
            setRun((prevState) => [
              ...prevState,
              {
                action: 'Xác nhận hiến máu',
                username: StaffAccount.username,
              },
            ]);
            confirmRegistrationForm(
              {
                eventRegistrationId: e.eventRegisterId,
                donationVolume: 350,
                heartRate: 80,
                systolicPressure: 120,
                diastolicPressure: 80,
                bodyTemperature: 36,
                height: 165,
                weight: 50,
                status: 0,
                note: 'tự động từ chối lấy máu',
                //status: index > index / 2 ? 1 : 0,
                //note: index > index / 2 ? null : 'Từ chối lấy máu tự động',
              },
              res.accessToken
            )
              .then((res) => {
                setResult((prevState) => [
                  ...prevState,
                  {
                    event: event,
                    message: 'Xác nhận thành công',
                    type: 'success',
                    username: StaffAccount.username,
                    action: 'Xác nhận hiến máu',
                    note: 'tự động từ chối lấy máu',
                  },
                ]);
              })
              .catch((error) => {
                console.log(errorHandler(error));
                setResult((prevState) => [
                  ...prevState,
                  {
                    event: event,
                    message: errorHandler(error),
                    type: 'error',
                    username: StaffAccount.username,
                    action: 'Xác nhận hiến máu',
                    note: 'tự động từ chối lấy máu',
                  },
                ]);
              });
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  async function runScript() {
    switch (category) {
      case 0:
        volunteerRegisterEvent();
        break;

      case 1:
        staffConfirm();
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
            startIcon={<Icon icon={loading ? 'solid-pause' : 'solid-play'} />}
            variant="contained"
            onClick={runScript}
          >
            {loading ? 'Đang chạy' : 'Chạy giả lập'}
          </Button>
        </Stack>
      </HeaderMainStyle>
      <Grid container spacing={2}>
        <Grid item md={5} sm={6} xs={12}>
          <RunContainer>
            <Stack direction={'column'} gap="12px" sx={{ overflow: 'auto', pt: 2 }}>
              {run.length > 0 &&
                run.map((item, index) => (
                  <div key={index}>
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
