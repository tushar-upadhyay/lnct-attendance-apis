import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import getFormData from './getFormData';
import * as qs from 'qs';
import { LoginService } from './login.service';

describe('AppController', () => {
  let appController: AppController;
  let loginService: LoginService;
  let username = process.env.ACCSOFT_ID;
  let password = process.env.PASSWORD;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [LoginService],
    }).compile();
    loginService = await app.resolve<LoginService>(LoginService);
    appController = app.get<AppController>(AppController);
  });

  describe('login', () => {
    jest.setTimeout(10000);

    it('It should return a valid form data response', async () => {
      const qsData = await getFormData({
        username,
        password,
        url: loginService.getUrls().login,
      });
      const response = qs.parse(qsData);
      expect(response).toHaveProperty('__VIEWSTATE');
      expect(response).toHaveProperty('__EVENTVALIDATION');
      expect(response).toHaveProperty('__VIEWSTATEGENERATOR');
      expect(response).toHaveProperty('ctl00$cph1$rdbtnlType');
      expect(response).toHaveProperty('ctl00$cph1$hdnSID');
      expect(response).toHaveProperty('ctl00$cph1$hdnSNO');
      expect(response).toHaveProperty('ctl00$cph1$hdnRDURL');
      expect(response).toHaveProperty('__ASYNCPOST', 'false');
      expect(response).toHaveProperty('ctl00$cph1$btnStuLogin', 'Login >>');
      expect(response).toHaveProperty(
        'ctl00$ScriptManager1',
        'ctl00$cph1$UpdatePanel5|ctl00$cph1$btnStuLogin',
      );
      expect(response).toHaveProperty('__EVENTTARGET', '');
      expect(response).toHaveProperty('__EVENTARGUMENT', '');
      expect(response).toHaveProperty('__LASTFOCUS', '');
      expect(response).toHaveProperty('ctl00$cph1$txtStuUser',username);
      expect(response).toHaveProperty('ctl00$cph1$txtStuPsw', password);
    });

    it('It should return a valid login response', async () => {
      loginService.setCollege('lnct');
      const response = await loginService.login(
        username,
       password,
        'lnct',
        false,
      );
      expect(response).toHaveProperty('Name','TUSHAR UPADHYAY');
      expect(response).toHaveProperty('ImageUrl');
      expect(response).toHaveProperty('Section');
      expect(response).toHaveProperty('Semseter');
      expect(response).toHaveProperty('Branch');
      expect(response).toHaveProperty('College');
      expect(response).toHaveProperty('Gender');
    });
  });
});
