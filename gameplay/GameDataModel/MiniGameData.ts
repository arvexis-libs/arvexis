

import {RegisterClass, SerializeClass, SerializeData } from "../../../modules/base/SerializeClass";
import { TimeUtility } from "../Utility/TimeUtility";

@RegisterClass("MiniGameData")
export class MiniGameData extends SerializeClass {
    __className:string = "MiniGameData";
    //@SerializeData()
    // public pianoDatas: PianoData[] = [];
    @SerializeData()
    public RoleId: number = 0;
    @SerializeData()
    public LevelId: number = 0;
    @SerializeData()
    public AllScore: number = 0;
    
    @SerializeData()
    public DicPianoData: Map<number,PianoData> = new Map();//keyroleId
    
}

@RegisterClass("PianoData")
export class PianoData extends SerializeClass{
    __className:string = "PianoData";
    @SerializeData()
    public DicLevelData: Map<number,number> = new Map();//keylevelId,valueTopScore
}
