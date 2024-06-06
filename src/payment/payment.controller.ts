import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import Razorpay from 'razorpay';
import { AppService } from '../app.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { createHmac } from 'crypto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard)
  @Post('make-payment')
  async createPayment(@Req() req: any, @Res() res: Response): Promise<any> {
    const resData = {
      status: false,
      d: {} as { order?: string; razorpayObjset?: any },
      message: '',
    };

    try {
      const {
        mainAmount,
        currency,
        plan,
        planCount,
        transferAccount,
        transferAmount,
      } = req.body;
      let options: any;
      let order: any;
      const razorInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
      });
      if (!plan && !transferAccount && !transferAmount) {
        // one time payments, no splits
        options = {
          amount: mainAmount,
          currency: currency,
          receipt: 'New-order',
        };
        order = await razorInstance.orders.create(options);
      } else if (plan && planCount) {
        // subscription for {planCount} months
        options = {
          plan_id: plan,
          total_count: planCount,
          customer_notify: 1,
          notes: {
            name: 'subscription',
          },
        };
        order = await razorInstance.subscriptions.create(options);
      } else if (transferAccount && transferAmount) {
        // transfor a amount to a linked account
        options = {
          amount: mainAmount,
          currency: currency,
          transfers: [
            {
              account: transferAccount,
              amount: transferAmount,
              currency: currency,
              on_hold: 0,
            },
          ],
        };
        order = await razorInstance.orders.create(options);
      }
      // resData.status = true;
      // resData.d.order = order.id;
      // resData.d.razorpayObjset = order;
      return res.status(HttpStatus.OK).json(order);
    } catch (err) {
      console.error(err);
      resData.status = false;
      resData.message = 'Error creating order';
      resData.d = err;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(resData);
    }
  }

  @UseGuards(AuthGuard)
  @Post('confirm-payment')
  async confirmPayment(@Req() req: any, @Res() res: Response): Promise<any> {
    const resData = {
      status: false,
      d: {},
      message: '',
    };
    console.log(req.body);

    const {
      order_uuid,
      razorpay_order_id,
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id,
    } = req.body;
    console.log(req.body);
    if (
      !order_uuid ||
      !(razorpay_order_id || razorpay_subscription_id) ||
      !razorpay_signature ||
      !razorpay_payment_id
    ) {
      console.log('Missing values');
      resData.message = 'Bad request';
      return res.status(HttpStatus.BAD_REQUEST).json(resData);
    }

    try {
      let isValid = false;
      // if(razorpay_order_id){
      //   isValid = validatePaymentVerification({
      //     order_id: razorpay_order_id,
      //     payment_id: razorpay_payment_id
      //   }, razorpay_signature, process.env.RAZORPAY_KEY);
      // } else {
      //   isValid = validatePaymentVerification({
      //     subscription_id: razorpay_subscription_id,
      //     payment_id: razorpay_payment_id,
      //   }, razorpay_signature, process.env.RAZORPAY_KEY);
      // }
      let hashData = '';
      if (razorpay_order_id) {
        hashData = createHmac('sha256', process.env.RAZORPAY_SECRET)
          .update(razorpay_order_id + '|' + razorpay_payment_id)
          .digest('hex');
      } else if (razorpay_subscription_id) {
        hashData = createHmac('sha256', process.env.RAZORPAY_SECRET)
          .update(razorpay_payment_id + '|' + razorpay_subscription_id)
          .digest('hex');
        //console.log(hashData);
      }

      if (razorpay_signature === hashData) {
        isValid = true;
      }

      if (isValid) {
        resData.status = true;
        resData.message = 'Payment verified successfully';
        return res.status(HttpStatus.OK).json(resData);
      } else {
        resData.message = 'Invalid payment verification';
        return res.status(HttpStatus.BAD_REQUEST).json(resData);
      }
    } catch (err) {
      console.error(err);
      resData.d = err;
      resData.message = 'Error verifying payment';
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(resData);
    }
  }
}
