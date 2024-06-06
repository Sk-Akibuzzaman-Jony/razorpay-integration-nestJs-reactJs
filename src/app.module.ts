import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, UsersModule, PaymentModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService] 
})
export class AppModule {}
