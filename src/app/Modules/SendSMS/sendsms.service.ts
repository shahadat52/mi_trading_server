import FormData from "form-data";
import config from "../../config";

const sendTxnSMSFromServer = async (
    phone: string,
    message: string
) => {
    try {
        const formData = new FormData();

        formData.append("token", config.sms_token as string);
        formData.append("to", phone);
        formData.append("message", message);

        const response = await fetch(
            `${config.send_sms_url}`,
            {
                method: "POST",
                body: formData as any,
            }
        );

        const result = await response.json();

        return result;
    } catch (error) {
        console.error("SMS Error:", error);
        throw error;
    }
};

export const smsSendServices = {
    sendTxnSMSFromServer
}