import { Box, Button, Grid, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { HeaderBreadcumbs, Icon } from 'components';
import React, { useState } from 'react';
import ResultItem from 'pages/script/components/result-item/ResultItem';
import { HeaderMainStyle, ResultContainer, RunContainer } from './RunScriptStyle';
import {
  listVolunteerAccount,
  registerEvent,
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

const RunScriptPage = () => {
  const [eventId, setEventId] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [run, setRun] = useState([]);
  const [result, setResult] = useState([]);
  const event = {
    eventId: eventId,
    participationDate: new Date().toISOString(),
    eventCode: '-',
    eventName: '-',
  };

  const openHubConnection = (token, username) => {
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
      hubConnection.on('ReceiveContent', (id, messageCode) => {
        console.log('ReceiveContent', id, messageCode);
        setResult((prevState) => [
          ...prevState,
          {
            event: event,
            message: `${messageCode}: ${convertErrorCodeToMessage(messageCode)}`,
            type: messageCode !== 7100 ? 'error' : 'success',
            username: username,
            eventRegisterId: id,
            action: 'Đăng ký hiến máu',
          },
        ]);
        if (id !== '') {
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
          )
            .then((res) => {
              setResult((prevState) => [
                ...prevState,
                {
                  event,
                  message: 'Điền phiếu đăng ký thành công',
                  type: 'success',
                  username: username,
                  action: 'Điền phiếu đăng ký',
                },
              ]);
            })
            .catch((error) => {
              setResult((prevState) => [
                ...prevState,
                {
                  event,
                  message: `${error?.response?.data?.code}: ${errorHandler(error)}`,
                  type: 'error',
                  username: username,
                  action: 'Điền phiếu đăng ký',
                },
              ]);
            })
            .finally(() => {
              console.log('close');
              setLoading(false);
              hubConnection.stop();
            });
        } else {
          console.log('close');
          setLoading(false);
          hubConnection.stop();
        }
      });

      hubConnection.start().then(() => {
        registerEvent({ eventId, participationDate: event.participationDate, eventCode: event.eventCode }, token);
      });
    } catch (error) {
      console.log(error);
    }
  };

  function volunteerRegisterEvent() {
    setRun([]);
    setResult([]);

    listVolunteerAccount.forEach((e) => {
      setLoading(true);
      setRun((prevState) => [
        ...prevState,
        {
          action: 'Đăng nhập',
          username: e,
        },
        {
          action: 'Đăng ký hiến máu',
          username: e,
        },
        {
          action: 'Điền phiếu đăng ký',
          username: e,
        },
      ]);
      loginUserPassword({
        username: e,
        password: 'Tinhnguyenvientest001//',
      }).then((res) => {
        openHubConnection(res.accessToken, e);
      });
    });
  }

  function staffConfirm() {
    setRun([]);
    // setResult([]);
    setLoading(true);
    setRun((prevState) => [
      ...prevState,
      {
        action: 'Đăng nhập',
        username: StaffAccount.username,
      },
    ]);
    loginUserPassword(StaffAccount).then((res) => {
      result.forEach((e, index) => {
        if (e.eventRegisterId != null && e.eventRegisterId.length > 1) {
          setRun((prevState) => [
            ...prevState,
            {
              action: 'Xác nhận hiến máu',
              username: `${StaffAccount.username} - ${e.username}`,
            },
          ]);
          confirmRegistrationForm(
            {
              eventRegistrationId: e.eventRegisterId,
              heartRate: 80,
              systolicPressure: 120,
              diastolicPressure: 80,
              bodyTemperature: 36,
              height: 165,
              weight: 50,
              status: index % 2 === 0 / 4 ? 1 : 0,
              note: index % 2 === 0 ? null : 'Từ chối lấy máu tự động',
              donationVolume: index % 2 === 0 ? 350 : null,
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
                  username: e.username,
                  action: 'Xác nhận hiến máu',
                  status: index % 2 === 0 ? 1 : 0,
                  note: index % 2 === 0 ? null : 'Từ chối lấy máu tự động',
                  donationVolume: index % 2 === 0 ? 350 : null,
                },
              ]);
            })
            .catch((error) => {
              setResult((prevState) => [
                ...prevState,
                {
                  event: event,
                  type: 'error',
                  message: `${error?.response?.data?.code}: ${errorHandler(error)}`,
                  username: e.username,
                  action: 'Xác nhận hiến máu',
                  status: index % 2 === 0 ? 1 : 0,
                  note: index % 2 === 0 ? null : 'Từ chối lấy máu tự động',
                  donationVolume: index % 2 === 0 ? 350 : null,
                },
              ]);
            })
            .finally(() => {
              setLoading(false);
            });
        }
      });
    });
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
          {category === 0 && (
            <TextField
              hiddenLabel
              variant="outlined"
              placeholder="Nhập id của sự kiện"
              value={eventId}
              onChange={(e) => {
                setEventId(e.target.value);
              }}
            />
          )}
          <Button
            id="sign-in-button"
            sx={{ whiteSpace: 'nowrap' }}
            startIcon={<Icon icon={loading ? 'solid-pause' : 'solid-play'} />}
            variant="contained"
            onClick={runScript}
            disabled={loading}
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
