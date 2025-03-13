import { SerializeClass, SerializeData } from "../../../modules/base/SerializeClass";
import { Notification } from "../../common/UINotification/Notification";
import ConfigManager from "../../manager/Config/ConfigManager";
import { ADEnum } from "../Manager/GameDot";
import {PlayerSystem} from "../Manager/PlayerSystem";
import { Utility } from "../Utility/Utility";

import { GameData } from "./GameData";

export class ShareData extends SerializeClass {

    __className:string = "ShareData";
    @SerializeData()
    public LastShareDate: Date = new Date(-8640000000000000); // DateTime.MinValue
    public get IsTodayFinish(): boolean {
        const now = new Date();
        return true;//now.toDateString() === this.LastShareDate.toDateString();
    }

    //
    @SerializeData()
    public ShareNum: Map<string, number[]> = new Map<string, number[]>();

    @SerializeData()
    private LoginNoticeFinish: boolean = false;

    constructor() {
        super();
        this.SetLoginNotice(false);
    }

    public SetLastShareDate(date: Date): void {
        this.LastShareDate = date;
        // 
        Notification.SetNeedRefresh(Notification.Type.Share);
    }

    public SetLoginNotice(value: boolean): void {
        this.LoginNoticeFinish = value;
        Notification.SetNeedRefresh(Notification.Type.Share);
    }

    public GetShareReward(): number {


        return 0;
    }

    public static CheckNotice(): boolean {
        const data = GameData.PlayerData.ShareData;
        return !data.LoginNoticeFinish && !data.IsTodayFinish;
    }

    public static ReduceShareNum(type: number): void {
        const saveFileName = Utility.GetYearMonthDay();
        const shareData = GameData.PlayerData.ShareData.ShareNum;
        
        if (shareData.has(saveFileName)) {
            const values = shareData.get(saveFileName)!;
            if (type < values.length) {
                values[type] = Math.max(0, values[type] - 1);
            }
        }
    }

    public static GetShareOrAD(type: ADEnum): number {
        const typeToNum = Number(type);
        if (typeToNum < 0) return 0;

        const share = ConfigManager.tables.TbShare.get(typeToNum);
        if (!share || share.Num === 0) return 0;

        const saveFileName = Utility.GetYearMonthDay();
        const shareData = GameData.PlayerData.ShareData.ShareNum;

        if (shareData.has(saveFileName)) {
            const values = shareData.get(saveFileName)!;
            return typeToNum < values.length ? values[typeToNum] : 0;
        }

        // 
        const newData: number[] = [];
        Object.values(ADEnum).forEach(ad => {
            if (typeof ad === 'number' && ad !== ADEnum.None) {
                const entry = ConfigManager.tables.TbShare.get(ad);
                newData.push(entry?.Num || 0);
            }
        });

        const result = newData[typeToNum] || 0;
        shareData.set(saveFileName, newData);
        return result;
    }
}