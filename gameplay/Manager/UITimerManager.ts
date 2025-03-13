import { Component } from "cc";
import { _decorator } from "cc";
import { PlayerSystem } from "./PlayerSystem";
import { GameData } from "../GameDataModel/GameData";
import { oops } from "db://oops-framework/core/Oops";
import { GameEvent } from "../../common/config/GameEvent";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { director } from "cc";
import { Node } from "cc";
import { GameDot } from "./GameDot";
const { ccclass, property } = _decorator;
@ccclass('UITimerManager')
export class UITimerManager extends GameComponent {
    private static _instance: UITimerManager;
    private persist: Node = null!

    public static get Instance() {
        if (this._instance == null) {
            this._instance = new UITimerManager();
        }

        return this._instance;
    }

    // 
    private oneHalfTimer: number = 0.5;
    private onceTimer: number = 1;
    private isStartRecordOfflineTime: boolean = false;

    get IsStartRecordOfflineTime(): boolean {
        return this.isStartRecordOfflineTime;
    }
    public async Init() {
        this.persist = new Node("UITimeManager");
        director.addPersistRootNode(this.persist);
        this.persist.addComponent(UITimerManager);
    }

    protected update(dt: number): void {
        // 1
        this.onceTimer -= dt;
        if (this.onceTimer <= 0) {
            this.onceTimer = 1;
            this.timerTaskAway();
            this.timerOffline();
            this.timerDot();
        }

        // 0.5
        this.oneHalfTimer -= dt;
        if (this.oneHalfTimer <= 0) {
            this.oneHalfTimer = 0.5;
            this.timerReduceAutoTime();
        }
    }

    //==============  ==============
    private timerTaskAway(): void {
        if (!PlayerSystem.Instance || !PlayerSystem.Instance.IsStartAwayTask) return;
        if (PlayerSystem.Instance.CurTaskAwayTimeStamp <= 0) return;

        // 
        const remindTime = PlayerSystem.Instance.CurTaskAwayTimeStamp - (Date.now() / 1000);
        if (remindTime < 0) {
            PlayerSystem.Instance.CurTaskAwayTimeStamp = 0;
            oops.message.dispatchEvent(GameEvent.OnTaskAwayDone);
        }
    }

    public startRecordOfflineTime(): void {
        this.isStartRecordOfflineTime = true;
    }

    private timerDot(): void {
        GameDot.Instance.SetTime();
    }

    private timerOffline(): void {
        if (!this.isStartRecordOfflineTime) return;
        if (!GameData.PlayerData || !GameData.PlayerData.GlobalData) return;
        GameData.PlayerData.GlobalData.OfflineTimer = Date.now() / 1000;
    }

    private timerReduceAutoTime(): void {

    }
}
