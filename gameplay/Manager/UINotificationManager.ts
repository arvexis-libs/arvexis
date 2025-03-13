import { Component } from 'cc';
import { _decorator } from 'cc';
import { GameComponent } from 'db://oops-framework/module/common/GameComponent';
import { Notification } from '../../common/UINotification/Notification';
import { director } from 'cc';
import { Node } from 'cc';
const { ccclass, executionOrder } = _decorator;

// 
@ccclass('UINotificationManager')
export class UINotificationManager extends GameComponent{
    private static _instance: UINotificationManager;
    private persist: Node = null!
 
    public static get Instance() {
        if (this._instance == null) {
            this._instance = new UINotificationManager();
        }
 
        return this._instance;
    }
    public async Init()
    {
        this.persist = new Node("UINotificationManager");
        director.addPersistRootNode(this.persist);
        this.persist.addComponent(UINotificationManager);
        Notification.InitNotification();
    }

    public SyncAllRedPoint()
    {
    }
    private onceTimer: number = 1;
    protected update(dt: number): void {
        this.onceTimer -= dt;
        if (this.onceTimer <= 0) {
            this.onceTimer = 1;
            Notification.Update();
        }
    }
}
