import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller()
export class AppController {
  constructor(private loginService: LoginService) {}

  @Get('/')
  async main(@Query() query, @Res() res) {
    const username = query.username;
    const password = query.password;
    let college = 'lnct';
    if (!username || !password)
      return res.status(302).redirect('https://lnct.netlify.app');
    if (query.lnctu || query.lnctu == '') {
      college = 'lnctu';
    }
    this.loginService.setUserCred(username, password, college);
    return res
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send(await this.loginService.getAttendance('attendance'));
  }

  @Get('/api')
  api() {
    return {
      msg: 'This feature is currently under development',
    };
  }

  @Get('/:type')
  async getAttendance(@Param('type') type, @Query() query) {
    const username = query.username;
    const password = query.password;
    let college = 'lnct';
    if (!username || !password) return { msg: 'Missing some params' };
    if (query.lnctu || query.lnctu == '') {
      college = 'lnctu';
    }
    this.loginService.setUserCred(username, password, college);
    if (type === 'login') return await this.loginService.login(false);
    return await this.loginService.getAttendance(type);
  }
}
