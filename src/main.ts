import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as methodOverride from 'method-override';
import './hbs-helpers';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Middleware
  app.use(express.urlencoded({ extended: true }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(methodOverride('_method'));

  // View engine setup
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Handlebars helpers
  hbs.registerHelper('add', (a, b) => a + b);
  hbs.registerHelper('subtract', (a, b) => a - b);
  hbs.registerHelper('gt', (a, b) => a > b);
  hbs.registerHelper('lt', (a, b) => a < b);
  hbs.registerHelper('capitalize', (str: string) => str?.charAt(0).toUpperCase() + str?.slice(1) || '');
  hbs.registerHelper('replaceHyphens', (str: string) => str?.replace(/-/g, ' ') || '');
  hbs.registerHelper('objectEntries', (obj) => Object.entries(obj));
  hbs.registerHelper('increment', (value) => parseInt(value) + 1);
  hbs.registerHelper('decrement', (value) => parseInt(value) - 1);
  hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
  hbs.registerHelper('eq', (a, b) => a === b);
  hbs.registerHelper('padNumber', (number, length) => number.toString().padStart(length, '0'));
  hbs.registerHelper('range', function (start, end, options) {
    let result = '';
    for (let i = start; i <= end; i++) {
      result += options.fn(i);
    }
    return result;
  });
  hbs.registerHelper('formatNumber', function (index, currentPage, limit) {
    const idx = Number(index);
    const page = Number(currentPage);
    const lim = Number(limit);
    if (isNaN(idx) || isNaN(page) || isNaN(lim)) {
      return 'NaN';
    }
    const globalIndex = (page - 1) * lim + idx + 1;
    return globalIndex.toString().padStart(4, '0');
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
