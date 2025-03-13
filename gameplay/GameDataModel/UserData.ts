// PlayerDataTypes.ts

import { RegisterClass, SerializeClass, SerializeData } from "../../../modules/base/SerializeClass";
import { Player } from "../Manager/PlayerSystem";

// 
// 
export class UserData extends SerializeClass {
    __className:string = "UserData";
    @SerializeData()
    Players: Map<number, Player> = new Map();
    @SerializeData()
    PlayerInfos: Map<number, PlayerInfo> = new Map();
}

// 
@RegisterClass("PlayerInfo")
export class PlayerInfo extends SerializeClass {
    __className:string = "PlayerInfo";
    @SerializeData()
    private _birthdayNum: number = 0;
    @SerializeData()
    private _hobbyNum: number = 0;
    @SerializeData()
    private _hWNum: number = 0;
    @SerializeData()
    private _bWHNum: number = 0;

    // 
    get Birthday(): number { return this._birthdayNum >= 2 ? 1 : 0; }
    set Birthday(val: number) { /*  */ }
    
    get Hobby(): number { return this._hobbyNum >= 3 ? 1 : 0; }
    set Hobby(val: number) { /*  */ }
    
    get HW(): number { return this._hWNum >= 4 ? 1 : 0; }
    set HW(val: number) { /*  */ }
    
    get BWH(): number { return this._bWHNum >= 5 ? 1 : 0; }
    set BWH(val: number) { /*  */ }

    // 
    get birthdayNum(): number { return this._birthdayNum; }
    set birthdayNum(value: number) {
        this._birthdayNum = value;
        this.Birthday = this._birthdayNum >= 2 ? 1 : 0;
    }
    
    get hobbyNum(): number { return this._hobbyNum; }
    set hobbyNum(value: number) {
        this._hobbyNum = value;
        this.Hobby = this._hobbyNum >= 3 ? 1 : 0;
    }
    
    get hWNum(): number { return this._hWNum; }
    set hWNum(value: number) {
        this._hWNum = value;
        this.HW = this._hWNum >= 4 ? 1 : 0;
    }
    
    get bWHNum(): number { return this._bWHNum; }
    set bWHNum(value: number) {
        this._bWHNum = value;
        this.BWH = this._bWHNum >= 5 ? 1 : 0;
    }
}

// 
@RegisterClass("SkinData")
export class SkinData extends SerializeClass{
    __className:string = "SkinData";
    @SerializeData()
    UnlockSkins: number[] = [0]; // 
    @SerializeData()
    LookNum: Map<number, number> = new Map(); // [skinId, viewCount]
}

// 
@RegisterClass("PhotoData")
export class PhotoData extends SerializeClass {

    __className:string = "PhotoData";
    @SerializeData()
    UnlockPhotoId: number[] = []; 
}

// 
// const player = new Player(1001);
// player.SkinData.UnlockSkins.push(1);
// player.SkinData.LookNum.set(1, 3);
