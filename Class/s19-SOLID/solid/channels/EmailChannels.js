import { INotificationChannel } from "../interfaces/INotificationChannel.js";

export class EmailChannel extends INotificationChannel {
    async send(recipient, payload) {
        console.log(`Sending email to ${recipient}: ${payload.htmlMessage}`);
        return { success: true, channel: "Email" };
    }
}