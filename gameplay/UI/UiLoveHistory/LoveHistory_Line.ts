import { Sprite } from "cc";
import { Label } from "cc";
import { _decorator } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { TrLoveHistory } from "../../../schema/schema";
import { GameData } from "../../GameDataModel/GameData";

const { ccclass, property } = _decorator;

@ccclass('LoveHistory_Line')
export class LoveHistory_Line extends GameComponent 
{
    public Init(number:number)
    {
        let index:number=0;
        for (const item of this.node.children) {
            item.active=(index+1==number);
            index++;
        }
    }
}