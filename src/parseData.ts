import axios from 'axios';
import * as cheerio from 'cheerio';
import { loginResponse } from './interfaces';
import jsonify from './jsonify';
export async function parseDashboardData(url, page): Promise<loginResponse> {
  const $ = cheerio.load(page);
  const streamData = $('#messagesDropdown')
    .text()
    .trim()
    .split('\n')[2]
    .trim()
    .split('-');
  const profileData = $('#userDropdown');
  const Name = profileData.first().text().trim();
  const postFix = profileData
    .children()
    .eq(1)
    .attr('src')
    .split('../studentphoto/')[1];
  url += postFix;
  if (postFix === '' || postFix === undefined) {
    url =
      'https://banner2.kisspng.com/20180920/efk/kisspng-user-logo-information-service-design-5ba34f88a0c3a6.5907352915374293846585.jpg';
  }
  const Branch = streamData[0];
  const Section = '';
  const College = 'LNCT';
  const Gender = await (
    await axios.get(`https://api.genderize.io?name=${Name.split(' ')[0]}`, {
      responseType: 'json',
    })
  ).data;
  const Semseter = streamData[1].split('')[1];
  return {
    Name,
    Branch,
    Section,
    Gender: Gender['gender'],
    Semseter,
    College,
    ImageUrl: url,
  };
}

export function parseFormData(page) {
  const $ = cheerio.load(page);
  const __VIEWSTATE = $('#__VIEWSTATE').val();
  const __VIEWSTATEGENERATOR = $('#__VIEWSTATEGENERATOR').val();
  const __EVENTVALIDATION = $('#__EVENTVALIDATION').val();
  const formData = {
    __VIEWSTATE,
    __EVENTVALIDATION,
    __VIEWSTATEGENERATOR,
    ctl00$cph1$rdbtnlType: 2,
    ctl00$cph1$hdnSID: '',
    ctl00$cph1$hdnSNO: '',
    ctl00$cph1$hdnRDURL: '',
    __ASYNCPOST: false,
    ctl00$cph1$btnStuLogin: 'Login >>',
    ctl00$ScriptManager1: 'ctl00$cph1$UpdatePanel5|ctl00$cph1$btnStuLogin',
    __EVENTTARGET: '',
    __EVENTARGUMENT: '',
    __LASTFOCUS: '',
  };
  return formData;
}

export function parseMainAttendance(page) {
  const $ = cheerio.load(page);
  const totalData = $('#ctl00_ContentPlaceHolder1_lbltotperiod').text();
  const total = parseInt(totalData.split(':')[1]);
  const present = parseInt(
    $('#ctl00_ContentPlaceHolder1_lbltotalp').text().split(':')[1],
  );
  const absent = parseInt(
    $('#ctl00_ContentPlaceHolder1_lbltotala').text().split(':')[1],
  );
  const leaves = parseInt(
    $('#ctl00_ContentPlaceHolder1_lbltotall').text().split(':')[1],
  );
  const attendance = present + leaves;
  let lecturesNeeded = 0;
  let daysNeeded = 0;
  const percentage = total == 0 ? 100 : ((attendance / total) * 100).round(2);
  if (percentage < 75) {
    lecturesNeeded = (0.75 * total - attendance) / 0.25;
    daysNeeded = Math.round(lecturesNeeded / 7);
  }
  const response = {
    'Total Lectures': total,
    Branch: '',
    College: '',
    DaysNeeded: daysNeeded,
    LecturesNeeded: lecturesNeeded,
    Name: '',
    Percentage: percentage,
    'Present ': attendance,
    Semester: '',
  };
  return response;
}

export function parseSubjectWiseAttendance(page) {
  const $ = cheerio.load(page);
  const trs = $('tr');
  const result = [];

  for (let i = 18; i < trs.length; i++) {
    const data = $(trs[i]).find('td');
    const total = $(data[2]).text();
    const present = $(data[3]).text();
    result.push({
      Subject: $(data[0]).text(),
      TotalLectures: total,
      Present: present,
      Percentage: ((parseInt(present) / parseInt(total)) * 100).round(2),
    });
  }
  const stringify = jsonify({ Percentage: 'float' });
  return stringify(result);
}

export function parseDateWiseAttendance(page) {
  const $ = cheerio.load(page);
  const totalData = $('#ctl00_ContentPlaceHolder1_lbltotperiod').text();
  const notApplicable = parseInt(
    $('#ctl00_ContentPlaceHolder1_lbltotaln').text().split(':')[1],
  );
  const total = parseInt(totalData.split(':')[1]) + notApplicable;
  const trs = $('tr');
  const temp = [];
  for (let i = 24; i < total + 24; i++) {
    const data = $(trs[i]).find('td');
    const date = $(data[1]).text();
    const subjectName = $(data[3]).text();
    const attendanceStatus = $(data[4]).text();
    const lastIndex = temp.length - 1;
    const attendanceObject = {};
    attendanceObject[subjectName] = attendanceStatus;
    const attendanceData = [];
    if (temp[lastIndex] == undefined || temp[lastIndex].date !== date)
      temp.push({
        date,
        data: [attendanceObject],
      });
    else temp[lastIndex].data.push(attendanceObject);
  }
  if (temp.length == 0) {
    const date = new Date().toDateString().split(' ');
    temp.push({
      data: [
        {
          'Classes for this semester is yet to begin': '',
        },
      ],
      date: `${date[2]} ${date[1]} ${date[3]}`,
    });
  }

  return [temp, temp.reverse()];
}

export function parseTillDateAttendance(page) {
  const $ = cheerio.load(page);
  const totalData = $('#ctl00_ContentPlaceHolder1_lbltotperiod').text();
  const notApplicable = parseInt(
    $('#ctl00_ContentPlaceHolder1_lbltotaln').text().split(':')[1],
  );
  const total = parseInt(totalData.split(':')[1]) + notApplicable;
  const trs = $('tr');
  const temp = [];
  let totalLectures = 0;
  let present = 0;
  for (let i = 24; i < total + 24; i++) {
    const data = $(trs[i]).find('td');
    const date = $(data[1]).text();
    const subjectName = $(data[3]).text();
    const attendanceStatus: number = $(data[4]).text() == 'A' ? 0 : 1;
    present = present + attendanceStatus;
    totalLectures += 1;
    const lastIndex = temp.length - 1;

    if (temp[lastIndex] == undefined || temp[lastIndex].date !== date)
      temp.push({
        date,
        present,
        totalLectures,
        percentage: ((present * 100) / totalLectures).round(2),
      });
    else {
      const tempObject = {
        totalLectures,
        present,
      };
      tempObject['percentage'] = ((present * 100) / totalLectures).round(2);

      temp[lastIndex] = { ...temp[lastIndex], ...tempObject };
    }
  }

  if (temp.length == 0) {
    const date = new Date().toDateString().split(' ');
    temp.push({
      date: `${date[2]} ${date[1]} ${date[3]}`,
      present: 0,
      totalLectures: 0,
      percentage: 100,
    });
  }
  const stringify = jsonify({ percentage: 'float' });
  return stringify(temp);
}
