import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import axios from 'axios';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  async catch(error: Error, host: ArgumentsHost) {
    await axios.post(
      'https://webhook.site/10382c8d-9459-4c09-88dd-2fe4c9ef1523',
      { error },
    );
    const response = host.switchToHttp().getResponse();
    return response.send('YOUR ID OR PASSWORD IS NOT CORRECT');
  }
}
