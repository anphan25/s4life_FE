import axios from 'axios';

const instance = axios.create();
instance.defaults.baseURL = 'https://rsapi.goong.io';

export async function getLocationByLatLong(lat, long, sessionToken) {
  return await instance.get(
    `/Geocode?latlng=${lat},%20${long}&api_key=${process.env.REACT_APP_GOONG_API_ACCESS_KEY}&sessiontoken=${sessionToken}`
  );
}

export async function getLocationByInput(input, sessionToken) {
  return await instance.get(
    `/Place/AutoComplete?input=${input}&api_key=${process.env.REACT_APP_GOONG_API_ACCESS_KEY}&sessiontoken=${sessionToken}`
  );
}

export async function getLocationByPlaceId(placeId, sessionToken) {
  return await instance.get(
    `/Place/Detail?place_id=${placeId}&api_key=${process.env.REACT_APP_GOONG_API_ACCESS_KEY}&sessiontoken=${sessionToken}`
  );
}
