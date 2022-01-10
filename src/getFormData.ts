import axios from 'axios';
import * as qs from 'qs';
import { parseFormData } from './parseData';

const getFormData = async ({ username, password, url }) => {
  let response = await axios.get(url);
  response = response.data;
  return qs.stringify({
    ...parseFormData(response),
    ctl00$cph1$txtStuUser: username,
    ctl00$cph1$txtStuPsw: password,
  });
};

export default getFormData;
