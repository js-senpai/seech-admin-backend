import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';
import { KpiModule } from './app/kpi/kpi.module';
import { TicketsBuyService } from './app/tickets-buy/tickets-buy.service';
import { TicketsBuyModule } from './app/tickets-buy/tickets-buy.module';
import { TicketsSaleModule } from './app/tickets-sale/tickets-sale.module';
import { KpiMonthlyModule } from './app/kpi-monthly/kpi-monthly.module';
import path from 'path';
import { I18nModule } from 'nestjs-i18n';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    // i18n
    I18nModule.forRoot({
      fallbackLanguage: 'ua',
      fallbacks: {
        ua: 'ua',
      },
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
    }),
    AuthModule,
    UserModule,
    KpiModule,
    TicketsBuyModule,
    TicketsSaleModule,
    KpiMonthlyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
