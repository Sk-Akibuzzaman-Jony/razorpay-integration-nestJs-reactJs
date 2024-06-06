import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AppModule } from '../app.module';
import { AppService } from '../app.service';

@Module({
  imports: [forwardRef(() => AppModule)], 
  providers: [PaymentService, AppService], 
  controllers: [PaymentController],
})
export class PaymentModule {}
