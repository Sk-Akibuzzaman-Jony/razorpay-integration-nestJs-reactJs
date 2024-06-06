import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  paymentInitOperation(razerOBJ: any): any {
    const resData: any = {
      status: false,
      d: {},
      message: ''
    };
    // DB OPERATION 
    resData.d.orderID = razerOBJ.id;
    resData.status = true;
    resData.message = 'Payment init';
    return resData;
  }

  paymentSuccessOperation(): string {
    return 'Success'; 
  }

  paymentFailOperation(): string {
    return 'Fail'; 
  }
}
