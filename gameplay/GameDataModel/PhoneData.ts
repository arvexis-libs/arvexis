// ChatSystemTypes.ts

import { RegisterClass, SerializeClass, SerializeData } from "../../../modules/base/SerializeClass";
import { TimeUtility } from "../Utility/TimeUtility";

@RegisterClass("PhoneData")
export class PhoneData extends SerializeClass {
    __className:string = "PhoneData";
    @SerializeData()
    public ChatDatas: Map<number, ChatData> = new Map();
}

@RegisterClass("ChatData")
export class ChatData extends SerializeClass {
    __className:string = "ChatData";
    @SerializeData()
    public RoleId: number = 0;
    @SerializeData()
    public ChatIds: number[] = [];
    @SerializeData()
    public LastTime: number = 0;
    /** groupid */
    @SerializeData()
    public ChatGroupDic: Map<number,number> = new Map();
    @SerializeData()
    public ClickSeeCount: number = 0;

    public RecordGroupNum(groupId: number, num: number) {
        if(this.ChatGroupDic == null || this.ChatGroupDic == undefined) {
            this.ChatGroupDic = new Map();
        }
        this.ChatGroupDic.set(groupId, num);
    }

    public AddNewSeeCount() {
        this.ClickSeeCount++;
    }
}

// 
// const phone = new PhoneData();
// phone.ChatDatas.push(new ChatData());
