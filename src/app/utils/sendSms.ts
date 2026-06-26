import config from "../config";

export const sendSMS = async ({ to, message }: { to: string; message: string }) => {
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

export const sendSMSByReve = async (phone: any, message: any) => {
    const params = new URLSearchParams(
        {
            apikey: config.reve_api_key as string,
            secretkey: config.reve_secret_key as string,
            callerID: config.reve_sender_id as string,
            toUser: phone,
            messageContent: message,
        }
    );

    const response = await fetch(`https://smpp.revesms.com:7790/sendtext?${params}`);

    const data = await response.json();
    return data;
}

