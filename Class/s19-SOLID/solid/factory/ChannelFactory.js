import { SmsChannel } from '../channels/SmsChannel';
import { EmailChannel } from '../channels/EmailChannels';

export class ChannelFactory {
    static createChannel(type) {
        switch (type) {
            case 'email':
                return new SmsChannel();
            case 'sms':
                return new EmailChannel();
            default:
                throw new Error(`Unknown channel type: ${type}`);
        }
    }
}