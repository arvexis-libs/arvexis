

import { serialize } from "v8";
import {RegisterClass, SerializeClass, SerializeData } from "../../../modules/base/SerializeClass";
import { TimeUtility } from "../Utility/TimeUtility";

@RegisterClass("HeroineData")
export class HeroineData extends SerializeClass {
    __className:string = "HeroineData";
    @SerializeData()
    public Name: string = "";
    @SerializeData()
    public Lv: number = 1;
    @SerializeData()
    public ExpCur: number = 0;
    @SerializeData()
    public HeadIcon: string = "";

    @SerializeData()
    public PowerSpeak: number = 0;//
    @SerializeData()
    public PowerBody: number = 0;//
    @SerializeData()
    public PowerAgility: number = 0;//
    @SerializeData()
    public PowerFeel: number = 0;//
    @SerializeData()
    public PowerWisdom: number = 0;//
    
    @SerializeData()
    public ListClothes:number[] = [];//
    @SerializeData()
    public ListIdentity:number[] = [];//
    @SerializeData()
    public ListUsedMagicBoxId:number[] = [];//

    @SerializeData()
    public CurVirtualTimePoint: number = 0;//,3 ([7, 8, 9, 10|10, 12, 16, 18|18, 20, 22, 7])
}
