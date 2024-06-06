import { toast } from 'react-toastify';
import { apiConnector } from '../api/apiConnector';

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

export async function displayRazorpay(amount, subscribe, subscriptionDuration, split, transferAccount, transferAmount) {
    const token = localStorage.getItem('token');
    let orderResponse = [];

    try {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        const apiUrl = 'http://localhost:4000/payment/make-payment';
        let payload = {} 
        if(subscribe){
            payload = { mainAmount: amount * 100, currency: "INR", plan: process.env.REACT_APP_PRO_PLAN_ID, planCount:subscriptionDuration}
        } else if(split) { 
            payload = {mainAmount: amount * 100, currency: "INR", transferAccount:transferAccount, transferAmount:transferAmount*100}
        } else {
            payload = {mainAmount: amount * 100, currency: "INR"}
        }

        orderResponse = await apiConnector("POST", apiUrl, payload, { Authorization: `Bearer ${token}` });
        console.log(orderResponse);

        if (!orderResponse) {
            alert("Server error. Are you online?");
            return;
        }

        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY,
            amount: `${orderResponse?.data?.amount}`,
            currency: orderResponse?.data?.currency,
            name: "Company",
            description: "Test Transaction",
            order_id: subscribe ? undefined : orderResponse.data.id,
            subscription_id: subscribe ? orderResponse.data.id : undefined,
            handler: async function (response) {
                console.log("Response from display razorpay", response);
                verifyPayment({ order_uuid: orderResponse.data.id, ...response}, token);  
            },
            theme: {
                color: "#61dafb",
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        paymentObject.on("payment.failed", function (response) {
            console.log("order Response", orderResponse);
            console.log(response?.error);
        });

    } catch (error) {
        console.log("PAYMENT ERROR...", error);
    }


}

async function verifyPayment(bodyData, token) {
    try {
        const response = await apiConnector("POST", 'http://localhost:4000/payment/confirm-payment', bodyData, { Authorization: `Bearer ${token}` });
        console.log("verifyPaymentResponse -> ", response);
        if (!response?.data?.status) {
            throw new Error(response.data.message);
        }

    } catch (error) {
        console.log("PAYMENT VERIFY ERROR...", error);
        toast.error("Could not verify payment");
    }

}

