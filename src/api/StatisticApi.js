import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/statistic';

export async function getDashboardData(dateStart, dateEnd) {
  const params = { dateStart, dateEnd };

  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}
