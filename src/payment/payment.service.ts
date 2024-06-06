import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import { createHmac } from 'crypto';

@Injectable()
export class PaymentService {
  async createPayment(
    mainAmount: number,
    currency: string,
    plan: string,
    planCount: number,
    transferAccount: string,
    transferAmount: number,
  ): Promise<any> {
    const razorInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    let options: any;
    let order: any;

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
      // transfer an amount to a linked account
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

    return order;
  }

  async verifyPayment(
    order_uuid: string,
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    razorpay_subscription_id?: string,
  ): Promise<any> {
    const resData = {
      status: false,
      d: {},
      message: '',
    };

    if (
      !order_uuid ||
      !(razorpay_order_id || razorpay_subscription_id) ||
      !razorpay_signature ||
      !razorpay_payment_id
    ) {
      resData.message = 'Bad request';
      return resData;
    }
    
    try {
      let isValid = false;
      let hashData = '';
      if (razorpay_order_id) {
        hashData = createHmac('sha256', process.env.RAZORPAY_SECRET)
          .update(razorpay_order_id + '|' + razorpay_payment_id)
          .digest('hex');
      } else if (razorpay_subscription_id) {
        hashData = createHmac('sha256', process.env.RAZORPAY_SECRET)
          .update(razorpay_payment_id + '|' + razorpay_subscription_id)
          .digest('hex');
      }

      if (razorpay_signature === hashData) {
        isValid = true;
      }

      if (isValid) {
        resData.status = true;
        resData.message = 'Payment verified successfully';
      } else {
        resData.message = 'Invalid payment verification';
      }
    } catch (err) {
      console.error(err);
      resData.d = err;
      resData.message = 'Error verifying payment';
    }

    return resData;
  }
}
