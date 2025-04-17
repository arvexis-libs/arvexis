import { Enum } from "cc";
import { ShareData } from "../../gameplay/GameDataModel/ShareData";
import { GameHelper } from "../../gameplay/GameTool/GameHelper";
import { HeartSystem } from "../../gameplay/Manager/HeartSystem";
import { PlayerSystem } from "../../gameplay/Manager/PlayerSystem";
import { IUINoticeable } from "./IUINoticeable";

export namespace Notification {
    export enum Type {
        DUMMY = 0,
        Test = 1,
        Phone,   // 
        Fitness, // 
        Photo,  //
        Carport = 5,    // 
        Invest = 6,     // 
        Secretary = 7,  // 
        ATMUnlock = 8,  // 
        Skin = 9,       // 
        Share = 10,     // 
        Online = 11,    // 
        LvReward = 12,  // 
        Interaction1 = 13,   //1
        Interaction2 = 14,   //2
        Interaction3 = 15,   //3
        Interaction4 = 16,   //4
        Interaction = 17,    //

        SendGift,
        OurStory, 
        TheStoryWithHim,
        MAX
    }   
    export function InitNotification(): void {
        // None
        Register(Type.DUMMY);

        Register(Type.Phone, GameHelper.IsHasPhoneRed);
        //Register(Type.Fitness, GameHelper.IsHasFitessRed);
        Register(Type.Photo, GameHelper.CheckPhotoRed);
        
        //Register(Type.ATMUnlock, PlayerSystem.Instance.MakeMoneyData.CheckATMUnlock);
        
        Register(Type.Share, ShareData.CheckNotice);
        
        Register(Type.Skin, GameHelper.IsHasSkinRed);
        //Register(Type.Online, GameHelper.IsHasOnlineRed);
        //Register(Type.LvReward, GameHelper.IsHasLvRewardRed);
        let Interaction = Register(Type.Interaction);
        //
        Register(Type.Interaction1, ()=>GameHelper.CheckPlayerInteractionRed(HeartSystem.Instance.getCurActionCfgId(2)),Interaction);
        Register(Type.Interaction2, ()=>GameHelper.CheckPlayerInteractionRed(HeartSystem.Instance.getCurActionCfgId(3)),Interaction);
        Register(Type.Interaction3, ()=>GameHelper.CheckPlayerInteractionRed(HeartSystem.Instance.getCurActionCfgId(4)),Interaction);
        Register(Type.Interaction4, ()=>GameHelper.CheckPlayerInteractionRed(HeartSystem.Instance.getCurActionCfgId(5)),Interaction);

        Register(Type.SendGift, GameHelper.IsHasItemCanSend);
    }

    class Notification {
        private _Count: number = 0;
        private _Parents: Notification[] = [];

        public m_CheckNotify: (() => boolean) | null = null;
        public m_NeedRefresh: boolean = false;
        public readonly Typekey: Type;
        public IsShowRed: boolean = true;

        constructor(typekey: Type, checkNotify: (() => boolean) | null = null, parents: Notification[] = []) {
            this.Typekey = typekey;
            this.m_CheckNotify = checkNotify;

            parents.forEach(parent => {
                if (parent.m_CheckNotify != null) {
                    console.error(`${parent.Typekey} parent`);
                    return;
                }
                this._Parents.push(parent);
            });
        }

        get Count(): number {
            return this._Count;
        }

        set Count(value: number) {
            this.ChangeCount(value - this._Count);
        }

        public SetShowRed(isShowRed: boolean): void {
            this.IsShowRed = isShowRed;
            this.NotifyListeners();
        }

        private ChangeCount(diff: number): void {
            if (diff === 0) return;

            this._Count += diff;
            if (this._Count < 0) this._Count = 0;

            this._Parents.forEach(p => p.ChangeCount(diff));
            this.NotifyListeners();
        }

        private NotifyListeners(): void {
            Listeners.forEach(l => {
                if (l.GetTypeKey() === this.Typekey) {
                    l.OnNotification(this._Count);
                }
            });
        }
    }

    const Container: Map<Type, Notification> = new Map();
    const Listeners: IUINoticeable[] = [];
    let _lastRefresh: Type = Type.DUMMY;
    const RefreshNumPerFrame: number = 10;

    export function Register(type: Type, checkNotify: (() => boolean) | null = null, ...parents: Notification[]): Notification {
        if (Container.has(type)) {
            return Container.get(type)!;
        }

        const notification = new Notification(type, checkNotify, parents);
        Container.set(type, notification);
        return notification;
    }

    export function Get(type: Type): Notification | undefined {
        return Container.get(type);
    }

    export function SetNeedRefresh(eType: Type): void {
        const notification = Container.get(eType);
        if (!notification) return;

        notification.m_NeedRefresh = true;
    }

    export function RefreshNotification(eType: Type): boolean {
        const notification = Container.get(eType);
        if (!notification || !notification.m_CheckNotify || !notification.m_NeedRefresh) {
            return false;
        }

        notification.m_NeedRefresh = false;
        notification.Count = notification.m_CheckNotify() ? 1 : 0;
        return true;
    }

    export function Update(): void {
        let _refreshNum = RefreshNumPerFrame;
        let t = _lastRefresh + 1;
        if (t >= Type.MAX) {
            t = Type.DUMMY;
        }

        for (; t < Type.MAX; t++) {
            _lastRefresh = t;
            if (RefreshNotification(t)) {
                _refreshNum--;
                if (_refreshNum === 0) break;
            }
        }
    }

    export function AddListener(listener: IUINoticeable): boolean {
        if (!listener || Listeners.includes(listener)) {
            return false;
        }

        Listeners.push(listener);
        const notification = Get(listener.GetTypeKey());
        if (notification) {
            listener.OnNotification(notification.Count);
        }

        return true;
    }

    export function RemoveListener(listener: IUINoticeable): boolean {
        if (!listener) return false;

        const index = Listeners.indexOf(listener);
        if (index >= 0) {
            Listeners.splice(index, 1);
            return true;
        }
        return false;
    }

    export function ResetAllNotification(): void {
        Container.forEach(notification => {
            notification.Count = 0;
        });
    }
    
	export function RefreshAllRedPoint()
	{
		let t = Type.DUMMY;
        
        for (; t < Type.MAX; t++) {
			SetNeedRefresh(t);
		}
	}
    
    export const TypeEnum = Enum(Type);
}