import { _decorator, Node, Enum } from "cc";
import { Component } from "cc";
import { IUINoticeable } from "./IUINoticeable";
import { Notification } from "./Notification";

const { ccclass, property } = _decorator;

@ccclass('UINotification')
export class UINotification extends Component implements IUINoticeable {
    @property(Node) private m_RedPoint: Node = null!;
    @property({ type: Notification.Type }) 
    private m_NotificationType: Notification.Type = Notification.Type.DUMMY;

    protected onLoad() {
        if (this.m_RedPoint != null) {
            this.m_RedPoint.active = false;
        }
    }

    protected onEnable() {
        Notification.AddListener(this);
    }

    protected onDisable() {
        Notification.RemoveListener(this);
    }

    public SetRedPoint(setRedObj: Node): void {
        this.m_RedPoint = setRedObj;
        this.SetNotificationCount();
    }

    public SetNotificationType(type: Notification.Type): void {
        if (this.m_NotificationType != type) {
            this.m_NotificationType = type;
            this.SetNotificationCount();
        }
    }

    public GetTypeKey(): Notification.Type {
        return this.m_NotificationType;
    }

    public OnNotification(curCount: number): void {
        this.SetNotificationCount();
    }

    private SetNotificationCount(): void {
        const no = Notification.Get(this.m_NotificationType);
        if (no != null) {
            const count = no.Count;
            if (this.m_RedPoint != null) {
                if (no.IsShowRed) {
                    this.m_RedPoint.active = count > 0;
                } else {
                    this.m_RedPoint.active = false;
                }
            }
        }
    }
}