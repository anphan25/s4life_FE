import { loginUserPassword, registerEvent } from 'api';
import { Box, Typography, Button, Stack, TextField } from '@mui/material';
import { convertErrorCodeToMessage } from 'utils';
import LoadingButton from '@mui/lab/LoadingButton';
import { useState } from 'react';
import axios from 'axios';
import moment from 'moment';

const DemoPage = () => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isButtonLoginLoading, setIsButtonLoginLoading] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [logs, setLogs] = useState([]);

  const configAxios = (token) => {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const EVENT_ID = '5f198c28-1576-4786-9874-3ef8adff9949'; //Demo 4
  let staffAccessToken = '';

  const password = 'Tinhnguyenvientest001//';
  const volunteerAccounts = [
    { username: 'tinhnguyenvientest0010' }, //Đã đăng ký/Dien form
    { username: 'tinhnguyenvientest0011' }, //Đã đăng ký/Dien form
    { username: 'tinhnguyenvientest00110' }, //Đã điền form
    { username: 'tinhnguyenvientest00111' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00112' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00113' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00114' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00115' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00116' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00117' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00118' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00119' }, //Đã đăng ký
    { username: 'tinhnguyenvientest0012' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00120' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00121' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00122' }, //Đã đăng ký
    { username: 'tinhnguyenvientest00123' }, //Đã đăng ký
    // { username: 'tinhnguyenvientest00124' },
    // { username: 'tinhnguyenvientest00125' },
    // { username: 'tinhnguyenvientest00126' },
    // { username: 'tinhnguyenvientest00127' },
    // { username: 'tinhnguyenvientest00128' },
    // { username: 'tinhnguyenvientest00129' },
    // { username: 'tinhnguyenvientest0013' },
    // { username: 'tinhnguyenvientest00130' },
    // { username: 'tinhnguyenvientest00131' },
    // { username: 'tinhnguyenvientest00132' },
    // { username: 'tinhnguyenvientest00133' },
    // { username: 'tinhnguyenvientest00134' },
    // { username: 'tinhnguyenvientest00135' },
    // { username: 'tinhnguyenvientest00136' },
    // { username: 'tinhnguyenvientest00137' },
    // { username: 'tinhnguyenvientest00138' },
    // { username: 'tinhnguyenvientest00139' },
    // { username: 'tinhnguyenvientest0014' },
    // { username: 'tinhnguyenvientest00140' },
    // { username: 'tinhnguyenvientest00141' },
    // { username: 'tinhnguyenvientest00142' },
    // { username: 'tinhnguyenvientest00143' },
    // { username: 'tinhnguyenvientest00144' },
    // { username: 'tinhnguyenvientest00145' },
    // { username: 'tinhnguyenvientest00146' },
    // { username: 'tinhnguyenvientest00147' },
    // { username: 'tinhnguyenvientest00148' },
    // { username: 'tinhnguyenvientest0015' },
    // { username: 'tinhnguyenvientest00150' },
    // { username: 'tinhnguyenvientest0016' },
    // { username: 'tinhnguyenvientest0017' },
    // { username: 'tinhnguyenvientest0018' },
    // { username: 'tinhnguyenvientest0019' },
  ];

  const staffAccount = { username: 'choraystaff1', password: 'Choraystaff//1' };

  const LoginForAll = () => {
    setIsButtonLoginLoading(true);

    volunteerAccounts.forEach(async (acc) => {
      const res = await loginUserPassword({ username: acc.username, password: password });
      console.log('res: ', res);
      acc.accessToken = res.accessToken;
    });

    setIsButtonLoginLoading(false);
  };

  console.log('volunteerAccounts', volunteerAccounts);
  const runDemo = async () => {
    try {
      setIsButtonLoading(true);
      //Đăng ký event
      // volunteerAccounts.forEach(async (acc) => {
      //   axios
      //     .post(
      //       `http://s4life.site/api/v1/event-registrations`,
      //       {
      //         eventId: EVENT_ID,
      //         participationDate: moment(new Date('2022-12-4')).local().format('YYYY-MM-DD'),
      //       },
      //       configAxios(acc.accessToken)
      //     )
      //     .then((postRegister) => {
      //       setLogs((old) => [...old, `POST eventRegistration: ${postRegister.status}`]);
      //     })
      //     .catch(function (err) {
      //       setLogs((old) => [
      //         ...old,
      //         `${err.config.method} ${err.config.url}: ${err.response?.data.code} - ${convertErrorCodeToMessage(
      //           err.response?.data.code * 1
      //         )}`,
      //       ]);
      //     });
      // });

      volunteerAccounts.forEach(async (acc, i) => {
        //Lấy event registration id
        const getRegisRes = await axios.get(
          `http://s4life.site/api/v1/event-registrations?EventId=${EVENT_ID}&Status=2`,
          configAxios(acc.accessToken)
        );
        console.log('getRegisRes.code: ', getRegisRes);

        setLogs((old) => [...old, `GET eventRegistrationId: ${getRegisRes.status || getRegisRes.code}`]);
        console.log('res: ', getRegisRes);

        const eventRegistrationId = getRegisRes.data?.result?.items[0]?.id;
        acc.eventRegistrationId = eventRegistrationId;

        //Điền form
        if (!eventRegistrationId) {
          return;
        }
        axios
          .patch(
            `http://s4life.site/api/v1/event-registrations`,
            {
              eventRegistrationId: eventRegistrationId,
              registrationForm: {
                isFirstTimeDonating: true,
                isDiseasedBefore: true,
                otherDiseaseDetail: 'string',
                isMalariaInfectedOrHadSurgery: true,
                isBloodTransfused: true,
                isVaccinatedAroundOneYear: true,
                otherVaccineDetailAroundOneYear: 'string',
                isLosingWeightWithoutCause: true,
                isHadGanglionRelatedDisease: true,
                isHadDentalTreatmentOrAcupunctureTreatment: true,
                isGotTatooedOrPierced: true,
                tatooOrPiercingDetail: 'string',
                isUsingDrugs: true,
                isHadSexualIntercourseWithHIVInfectedPerson: true,
                isHadHomoeroticSexualIntercourse: true,
                isHadBronchitisOrPneumoniaOrRubella: true,
                otherDiseaseDetailAroundOneMonth: 'string',
                isVaccinatedAroundOneMonth: true,
                otherVaccineDetailAroundOneMonth: 'string',
                isTravelledIntoInfectedZone: true,
                isHadFluAroundOneWeek: true,
                isUsingAntibiotic: true,
                isVaccinatedAroundOneWeek: true,
                otherVaccineDetailAroundOneWeek: 'string',
                isPregnant: true,
                isHadAPeriodAroundOneWeek: true,
                isComfirmedToPerformHIVTest: true,
              },
            },
            configAxios(acc.accessToken)
          )
          .then((fillFormRes) => {
            setLogs((old) => [...old, `PATCH eventRegistration: ${fillFormRes.status}`]);
          })
          .catch(function (err) {
            setLogs((old) => [
              ...old,
              `${err.config.method} ${err.config.url}: ${err.response.data.code} - ${convertErrorCodeToMessage(
                err.response?.data.code * 1
              )}`,
            ]);
          });

        console.log('volunteerAccounts after fill form', volunteerAccounts);

        //Staff confirm
        if (!eventRegistrationId) {
          return;
        }
        const res = await loginUserPassword({ username: staffAccount.username, password: staffAccount.password });
        staffAccessToken = res.accessToken;
        axios
          .patch(
            `http://s4life.site/api/v1/event-registrations/confirm`,
            {
              eventRegistrationId: eventRegistrationId,
              donationVolume: 250,
              heartRate: 100,
              systolicPressure: 120,
              diastolicPressure: 80,
              bodyTemperature: 0,
              height: 100,
              weight: 100,
              status: i % 2 === 0 ? 0 : 1,
              note: 'testttttt',
            },
            configAxios(staffAccessToken)
          )
          .then((confirmRes) => {
            setLogs((old) => [...old, `PATCH eventRegistration confirm: ${confirmRes.status}`]);
          })
          .catch(function (err) {
            setLogs((old) => [
              ...old,
              `${err.config.method} ${err.config.url}: ${err.response.data.code} - ${convertErrorCodeToMessage(
                err.response?.data.code * 1
              )}`,
            ]);
          });
      });

      setIsButtonLoading(false);
    } catch (err) {
      console.log(err);
      setIsButtonLoading(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={3}>
        <LoadingButton
          loading={isButtonLoginLoading}
          variant="contained"
          onClick={() => {
            LoginForAll();
          }}
        >
          Login
        </LoadingButton>

        <LoadingButton
          loading={isButtonLoading}
          variant="contained"
          onClick={() => {
            runDemo();
          }}
        >
          Run
        </LoadingButton>
      </Stack>
      <Box sx={{ marginTop: '10px' }}>
        {logs?.map((log, i) => (
          <Typography key={i}>{log}</Typography>
        ))}
      </Box>
    </>
  );
};

export default DemoPage;
