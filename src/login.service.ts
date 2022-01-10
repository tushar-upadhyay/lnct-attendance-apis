import { Injectable, Scope } from '@nestjs/common';
import axios from 'axios';
import { loginResponse } from './interfaces';
import getFormData from './getFormData';
import {
  parseDashboardData,
  parseDateWiseAttendance,
  parseMainAttendance,
  parseSubjectWiseAttendance,
  parseTillDateAttendance,
} from './parseData';

@Injectable({ scope: Scope.REQUEST })
export class LoginService {
  private college = 'lnct';
  private cookie: string;

  headers() {
    return {
      Cookie: this.cookie,
    };
  }

  getUrls() {
    const lnctBaseUrl = process.env.LNCT_BASE_URL;
    const lnctuBaseUrl = process.env.LNCTU_BASE_URL;
    const url = this.college == 'lnct' ? lnctBaseUrl : lnctuBaseUrl;
    const urls = {
      image: url + 'studentphoto/',
      login: url + 'StudentLogin.aspx',
      dashboard: url + 'Parents/ParentDesk.aspx',
      attendance: url + 'Parents/StuAttendanceStatus.aspx',
      subject: url + 'parents/subwiseattn.aspx',
    };
    return urls;
  }
  setCollege(college) {
    this.college = college;
  }
  async login(
    username: string,
    password: string,
    college: string,
    loginOnly: boolean,
  ): Promise<loginResponse> | null {
    this.college = college;
    const formData = await getFormData({
      username,
      password,
      url: this.getUrls().login,
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    let response = await axios.post(this.getUrls().login, formData, {
      headers,
      maxRedirects: 0,
      validateStatus: (status) => status == 302,
    });
    const cookie = response.headers['set-cookie'][0].split(';')[0];
    if (!cookie) throw new Error('Id or password not valid');
    this.cookie = cookie;
    if (loginOnly) {
      return;
    }
    response = await axios.get(this.getUrls().dashboard, {
      headers: { Cookie: cookie },
    });
    return await parseDashboardData(this.getUrls().image, response.data);
  }

  async getAttendance(
    username: string,
    password: string,
    college: string,
    type: string,
  ) {
    await this.login(username, password, college, true);
    if (type == 'subjectwise') {
      const response = await axios.get(this.getUrls().subject, {
        headers: this.headers(),
      });
      return parseSubjectWiseAttendance(response.data);
    }
    const response = await axios.get(this.getUrls().attendance, {
      headers: this.headers(),
    });
    if (type == 'attendance') return parseMainAttendance(response.data);
    if (type == 'dateWise') return parseDateWiseAttendance(response.data);
    if (type == 'getDateWiseAttendance')
      return parseTillDateAttendance(response.data);
    return { msg: 'route not found' };
  }
}
