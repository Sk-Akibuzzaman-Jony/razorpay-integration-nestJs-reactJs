import { Controller, Post, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AuthGuard)
  @Post('make-payment')
  async createPayment(@Req() req: any, @Res() res: Response): Promise<any> {
    const {
      mainAmount,
      currency,
      plan,
      planCount,
      transferAccount,
      transferAmount,
    } = req.body;

    try {
      const order = await this.paymentService.createPayment(
        mainAmount,
        currency,
        plan,
        planCount,
        transferAccount,
        transferAmount,
      );

      return res.status(HttpStatus.OK).json(order);
    } catch (err) {
      console.error(err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: false, message: 'Error creating order', d: err });
    }
  }

  @UseGuards(AuthGuard)
  @Post('confirm-payment')
  async confirmPayment(@Req() req: any, @Res() res: Response): Promise<any> {
    const {
      order_uuid,
      razorpay_order_id,
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id,
    } = req.body;

    try {
      const verificationResult = await this.paymentService.verifyPayment(
        order_uuid,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id,
      );

      return res.status(HttpStatus.OK).json(verificationResult);
    } catch (err) {
      console.error(err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: false, message: 'Error verifying payment', d: err });
    }
  }
}
