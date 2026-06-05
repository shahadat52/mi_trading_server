import config from "../config";

const sendSMS = async ({ to, message }: { to: string; message: string }) => {
    const params = new URLSearchParams({
        token: config.sms_token as string,
        to,
        message,
    });

    const response = await fetch(
        config.send_sms_url as string,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        }
    );

    const data = await response.text(); // API usually returns text
    return data;
};

export default sendSMS;