import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user/user.module';
import { KpiModule } from './app/admin/kpi/kpi.module';
import { TicketsBuyModule } from './app/admin/tickets-buy/tickets-buy.module';
import { TicketsSaleModule } from './app/admin/tickets-sale/tickets-sale.module';
import { KpiMonthlyModule } from './app/admin/kpi-monthly/kpi-monthly.module';
import { I18nModule } from 'nestjs-i18n';
import { PricesModule } from './app/admin/prices/prices.module';
import * as path from 'path';
import { SelectedTicketsModule } from './app/admin/selected-tickets/selected-tickets.module';
import { SellProductsModule } from './app/user/sell-products/sell-products.module';

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
    PricesModule,
    SelectedTicketsModule,
    SellProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
