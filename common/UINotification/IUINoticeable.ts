import { Notification } from "./Notification";

export interface IUINoticeable {
    /**
     * 
     */
    GetTypeKey(): Notification.Type;

    /**
     * 
     * @param curCount 
     */
    OnNotification(curCount: number): void;
}
