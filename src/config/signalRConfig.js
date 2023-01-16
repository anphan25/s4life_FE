import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { getAccessToken } from 'api';
import jwtDecode from 'jwt-decode';

export const openHubConnection = async (store) => {
  const hubConnection = new HubConnectionBuilder()
    .configureLogging(LogLevel.Information)
    .withUrl(process.env.REACT_APP_SIGNALR_URL, {
      accessTokenFactory: () => {
        const accessToken = store.getState().auth.auth?.accessToken;
        if (jwtDecode(accessToken).exp < Date.now() / 1000)
          return getAccessToken(store.getState().auth.auth?.refreshToken);

        return accessToken;
      },
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .build();

  try {
    await hubConnection.start();
  } catch (error) {
    console.log(error);
  }

  return hubConnection;
};

export const listenOnHub = (connection, onReceive) => {
  if (!connection) return;
  try {
    connection.on('ReceiveMessage', (messageCode) => {
      onReceive(messageCode);
    });
  } catch (error) {
    console.log(error);
  }
};
