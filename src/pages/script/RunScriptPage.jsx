import { Box, Button, Grid, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { HeaderBreadcumbs, Icon } from 'components';
import React, { useState } from 'react';
import ResultItem from 'pages/script/components/result-item/ResultItem';
import { HeaderMainStyle, ResultContainer, RunContainer } from './RunScriptStyle';
import {
  listVolunteerAccount,
  registerEvent,
  StaffAccount,
  editEventRegistration,
  listReject,
  changeTime,
} from './Script';
import { convertErrorCodeToMessage, dateToISOLikeButLocal, errorHandler, formatDate } from 'utils';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { loginUserPassword } from 'api';
import moment from 'moment';
import { DateTimePicker } from '@mui/x-date-pickers';

const categoryList = [
  {
    name: 'Đăng ký sự kiện',
    value: 0,
  },
  {
    name: 'Xác nhận tham gia',
    value: 1,
  },
  {
    name: 'Xác nhận hiến máu',
    value: 2,
  },
  {
    name: 'Đổi thời gian',
    value: 3,
  },
];

const RunScriptPage = () => {
  const [eventId, setEventId] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [run, setRun] = useState([]);
  const [result, setResult] = useState([]);
  const [listEventId, setListEventId] = useState([]);
  const event = {
    eventId: eventId,
    participationDate: new Date().toISOString(),
  };
  const [dateChange, setDateChange] = useState(moment(new Date().toISOString()));
  const [totalApproval, setTotalApproval] = useState(0);
  const [totalReject, setTotalReject] = useState(0);

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
      switch (category) {
        case 0:
          setListEventId([]);
          hubConnection.on('ReceiveContent', async (id, messageCode) => {
            console.log('ReceiveContent', id, messageCode);
            setListEventId((prev) => [
              ...prev,
              {
                username,
                id,
              },
            ]);
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
              editEventRegistration(
                {
                  updateMode: 1,
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
                .finally(async () => {
                  await hubConnection.stop();
                  console.log('close');
                  setLoading(false);
                });
            } else {
              await hubConnection.stop();
              console.log('close');
              setLoading(false);
            }
          });

          hubConnection.start().then(() => {
            registerEvent({ eventId, participationDate: event.participationDate }, token);
          });
          break;

        case 1:
          listEventId.forEach(async (e) => {
            if (e['id'] !== '') {
              setRun((prevState) => [
                ...prevState,
                {
                  action: 'Xác nhận đăng ký',
                  username,
                },
              ]);

              editEventRegistration(
                {
                  updateMode: 2,
                  eventRegistrationId: e['id'],
                },
                token
              )
                .then((res) => {
                  setResult((prevState) => [
                    ...prevState,
                    {
                      event,
                      message: 'Xác nhận tham gia thành công',
                      type: 'success',
                      username: username,
                      action: 'Xác nhận tham gia',
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
                      action: 'Xác nhận tham gia',
                    },
                  ]);
                });
            }
          });

          break;

        case 2:
          setTotalApproval(0);
          setTotalReject(0);
          setLoading(true);
          listEventId.forEach(async (e, i) => {
            if (e['id'] !== '') {
              setRun((prevState) => [
                ...prevState,
                {
                  action: 'Xác nhận hiến máu',
                  username,
                },
              ]);
              if (hubConnection.state === HubConnectionState.Disconnected) {
                await hubConnection.start();
              }

              editEventRegistration(
                {
                  updateMode: 3,
                  eventRegistrationId: e['id'],
                  confirmationForm: {
                    heartRate: 80,
                    systolicPressure: 120,
                    diastolicPressure: 80,
                    bodyTemperature: 36,
                    height: 165,
                    weight: 50,
                    status: !listReject.includes(e['username']) ? 1 : 0,
                    note: !listReject.includes(e['username']) ? null : 'Từ chối lấy máu tự động',
                    donationVolume: !listReject.includes(e['username']) ? 350 : null,
                    eventCode: null,
                  },
                },
                token
              );
              hubConnection.on('ReceiveMessage', async (messageCode) => {
                console.log('ReceiveMessage', messageCode);
                if (!listReject.includes(e['username'])) {
                  setTotalApproval((prev) => prev + 1);
                } else {
                  setTotalReject((prev) => prev + 1);
                }
                setResult((prevState) => [
                  ...prevState,
                  {
                    event: event,
                    message: `${messageCode}: ${convertErrorCodeToMessage(messageCode)}`,
                    type: messageCode !== 7200 ? 'error' : 'success',
                    username: username,
                    status: !listReject.includes(e['username']) ? 1 : 0,
                    note: !listReject.includes(e['username']) ? null : 'Từ chối lấy máu tự động',
                    donationVolume: !listReject.includes(e['username']) ? 350 : null,
                    action: 'Xác nhận hiến máu',
                  },
                ]);
                console.log('close');
                await hubConnection.stop();
                setLoading(false);
              });
            }
          });
          break;

        default:
          break;
      }
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

  function staffCheckin() {
    setRun([]);
    setResult([]);

    setRun((prevState) => [
      ...prevState,
      {
        action: 'Đăng nhập',
        username: StaffAccount.username,
      },
    ]);
    loginUserPassword(StaffAccount).then((res) => {
      openHubConnection(res.accessToken, StaffAccount.username);
    });
  }

  function staffConfirm() {
    setRun([]);
    setResult([]);

    setRun((prevState) => [
      ...prevState,
      {
        action: 'Đăng nhập',
        username: StaffAccount.username,
      },
    ]);
    loginUserPassword(StaffAccount).then((res) => {
      openHubConnection(res.accessToken, StaffAccount.username);
    });
  }

  function changeCurrentTime() {
    setRun((prevState) => [
      ...prevState,
      {
        action: 'Đăng nhập',
        username: 'admin001',
      },
      {
        action: 'Đổi thời gian',
        username: 'admin001',
      },
    ]);
    loginUserPassword({
      username: 'admin001',
      password: 'Admin001//',
    }).then((response) => {
      var date = formatDate(dateChange, 6);
      changeTime(date, response.accessToken).then((res) => {
        setResult((prevState) => [
          ...prevState,
          {
            message: `Đổi thời gian thành công`,
            type: 'success',
            username: 'admin001',
            action: 'Đổi thời gian',
          },
        ]);
      });
    });
  }

  async function runScript() {
    switch (category) {
      case 0:
        volunteerRegisterEvent();
        break;

      case 1:
        staffCheckin();
        break;

      case 2:
        staffConfirm();
        break;

      case 3:
        changeCurrentTime();
        break;

      default:
        break;
    }
  }

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    if (event.target.value === 1) {
      setTotalApproval(0);
      setTotalReject(0);
    }
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
          {category === 3 && (
            <DateTimePicker
              value={dateChange}
              onChange={(newValue) => {
                setDateChange(newValue);
              }}
              renderInput={(params) => <TextField {...params} inputProps={params.inputProps} />}
            />
          )}

          <Button
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
          {!loading && category == 2 && (totalApproval > 0 || totalReject > 0) && (
            <Box sx={{ px: 3, py: 2, backgroundColor: 'white', mb: 2, borderRadius: '0.475rem', width: 'fit-content' }}>
              <Typography fontSize={16} fontWeight={500}>
                Kết quả xác nhận lấy máu:
              </Typography>
              <Stack direction={'row'} alignItems={'center'} gap={3} sx={{ mt: 1 }}>
                <Box>
                  <Stack direction={'row'} alignItems={'center'} gap={1}>
                    <Icon icon="solid-check" sx={{ color: 'success.main' }} />
                    <Typography fontSize={14}>Chấp nhận</Typography>
                  </Stack>
                  <Typography fontSize={22} fontWeight={700} sx={{ ml: 6 }}>
                    {totalApproval}
                  </Typography>
                </Box>
                <Box>
                  <Stack direction={'row'} alignItems={'center'} gap={1}>
                    <Icon icon="solid-times" sx={{ color: 'error.main' }} />
                    <Typography fontSize={14}>Từ chối</Typography>
                  </Stack>
                  <Typography fontSize={22} fontWeight={700} sx={{ ml: 4.5 }}>
                    {totalReject}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
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
