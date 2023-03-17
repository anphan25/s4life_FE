import { HubConnectionBuilder } from '@microsoft/signalr';
import { getAccessToken } from 'api';
import jwtDecode from 'jwt-decode';

export const openHubConnection = async (store) => {
  const hubConnection = new HubConnectionBuilder()
    .withUrl(process.env.REACT_APP_SIGNALR_URL, {
      accessTokenFactory: () => {
        const accessToken = typeof store === 'string' ? store : store.getState().auth.auth?.accessToken;
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
    connection?.on('ReceiveMessage', (messageCode) => {
      onReceive(messageCode);
    });
  } catch (error) {
    console.log(error);
  }
};

export const listenOnHubInBulkOperations = (connection, onReceive) => {
  if (!connection) return;
  try {
    connection?.on('ReceiveResult', (result, messageCode) => {
      onReceive(result, messageCode);
    });
  } catch (error) {
    console.log(error);
  }
};

export const listenOnHubToGetContent = (connection, onReceive) => {
  if (!connection) return;
  try {
    connection?.on('ReceiveContent', (result, messageCode) => {
      onReceive(result, messageCode);
    });
  } catch (error) {
    console.log(error);
  }
};
