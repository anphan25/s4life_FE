import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/statistic';

export async function getStatisticData(FilterMode, dateStart, dateEnd, isDiscrete) {
  const params = { FilterMode, dateStart, dateEnd, isDiscrete };

  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}
