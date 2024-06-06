import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { displayRazorpay } from '../operations/PaymentAPI';

const PaymentPage = () => {
  const [amount, setAmount] = useState(500);
  const [transferAccount, setTransferAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  const [subscriptionDuration, setSubscriptionDuration] = useState(6);

  const handlePayment = () => {
    if (amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    displayRazorpay(amount, false, 0, false, '', 0); // amount, subscribe(true/false), subscriptionDuration, split, transferAccount, transferAmount
  };

  const handleSubscription = () => {
    displayRazorpay(0, true, subscriptionDuration, false, '', 0);
  };

  const handleSplitPayment = () => {
    if (amount <= 0 || transferAmount <= 0 || !transferAccount) {
      toast.error("Please enter valid details for split payment.");
      return;
    }
    displayRazorpay(amount, false, 0, true, transferAccount, transferAmount);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 space-x-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">One-Time Payment</h2>
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (INR)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              required
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={handlePayment}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
            >
              Pay
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Subscription</h2>
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="subscriptionDuration" className="block text-sm font-medium text-gray-700">
              Subscription Duration
            </label>
            <select
              id="subscriptionDuration"
              name="subscriptionDuration"
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={subscriptionDuration}
              onChange={(e) => setSubscriptionDuration(parseInt(e.target.value))}
            >
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>
          <div>
            <button
              onClick={handleSubscription}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
            >
              Pay {subscriptionDuration === 6 ? '299/month for 6 months' : '299/month for 12 months'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Split Payment</h2>
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (INR)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              required
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="splitAmount" className="block text-sm font-medium text-gray-700">
              Transfer Amount (INR)
            </label>
            <input
              id="splitAmount"
              name="splitAmount"
              type="number"
              required
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="transferAccount" className="block text-sm font-medium text-gray-700">
              Transfer Account
            </label>
            <input
              id="transferAccount"
              name="transferAccount"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={transferAccount}
              onChange={(e) => setTransferAccount(e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={handleSplitPayment}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
            >
              Initiate Split Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
