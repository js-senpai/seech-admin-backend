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
    AuthModule,
    UserModule,
    KpiModule,
    TicketsBuyModule,
    TicketsSaleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
