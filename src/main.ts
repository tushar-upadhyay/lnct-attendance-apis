import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ErrorFilter } from './error.filter';
import * as _cluster from 'cluster';
const cluster = _cluster as unknown as _cluster.Cluster;
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { cpus } from 'os';
declare global {
  interface Number {
    round: (p: number) => number;
  }
}
Number.prototype.round = function (p: number) {
  p = p || 10;
  let ans: number = parseFloat(this.toFixed(p));
  if (Math.round(this) === ans) ans += 0.01;
  return ans;
};
// dotenv.config({ path: 'src/.env' });
if (process.env.NODE_ENV == 'development') dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors();
  app.useGlobalFilters(new ErrorFilter());
  await app.listen(process.env.PORT, '0.0.0.0');
}

if (cluster.isMaster) {
  console.log(`Master ${process.pid} started`);
  cluster.on('fork', () => {
    console.log('cluster forked');
  });
  for (let i = 0; i < cpus().length; i++) {
    cluster.fork();
  }
  cluster.on('fork', () => {
    console.log('cluster forked');
  });
  cluster.on('exit', (s) => {
    cluster.fork();
  });
} else {
  bootstrap();
}
