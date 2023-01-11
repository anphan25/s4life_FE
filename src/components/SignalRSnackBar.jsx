// import { useStore } from 'react-redux';
// import { useState, useEffect, memo } from 'react';
// import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
// import { convertErrorCodeToMessage } from 'utils';
// import { getAccessToken } from 'api';
// import { CustomSnackBar } from 'components';

// export const SignalRSnackBar = () => {
//   const store = useStore();
//   const [signalRAlert, setSignalRAlert] = useState({
//     message: '',
//     status: false,
//     type: 'success',
//   });
//   const [connection, setConnection] = useState(null);

//   const createConnection = async () => {
//     // Disconnect to hub
//     // if (isConnected === false && connection) {
//     //   await connection.stop();
//     //   setConnection(null);

//     //   return;
//     // }
//     const hubConnection = new HubConnectionBuilder()
//       .configureLogging(LogLevel.Information)
//       .withUrl(process.env.REACT_APP_SIGNALR_URL, {
//         accessTokenFactory: () => {
//           return getAccessToken(store.getState().auth.auth?.refreshToken);
//         },
//         withCredentials: false,
//       })
//       .withAutomaticReconnect()
//       .build();

//     try {
//       //   debugger;
//       await hubConnection.start();
//     } catch (error) {
//       console.log(error);
//     }

//     setConnection(hubConnection);
//   };

//   useEffect(() => {
//     createConnection();
//   }, []);

//   useEffect(() => {
//     if (!connection) return;
//     try {
//       connection.on('ReceiveMessage', (messageCode) => {
//         console.log('messageCode', messageCode);
//         setSignalRAlert({
//           message: convertErrorCodeToMessage(messageCode),
//           type: messageCode < 0 ? 'error' : 'success',
//           status: true,
//         });
//       });
//       connection.onclose((e) => {
//         setConnection(null);
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   }, [connection]);

//   return (
//     <>
//       {signalRAlert?.status && (
//         <CustomSnackBar sx={{ marginTop: '50px' }} message={signalRAlert.message} type={signalRAlert.type} />
//       )}
//     </>
//   );
// };

// // export default memo(SignalRSnackBar);
