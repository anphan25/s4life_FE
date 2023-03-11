import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/statistic';

export async function getDashboardData(dateStart, dateEnd, isDiscrete) {
  const params = { dateStart, dateEnd, isDiscrete };

  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}
