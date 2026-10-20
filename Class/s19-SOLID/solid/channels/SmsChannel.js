import { INotificationChannel } from "../interfaces/INotificationChannel.js";

export class SmsChannel extends INotificationChannel {
    async send(recipient, payload) {
        console.log(`Sending SMS to ${recipient}: ${payload}`);
        return { success: true, channel: 'SMS' };
    }
}