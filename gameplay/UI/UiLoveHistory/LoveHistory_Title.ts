import { Sprite } from "cc";
import { Label } from "cc";
import { _decorator } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { TrLoveHistory } from "../../../schema/schema";
import { GameData } from "../../GameDataModel/GameData";

const { ccclass, property } = _decorator;

@ccclass('LoveHistory_Title')
export class LoveHistory_Title extends GameComponent 
{
    @property(Sprite)
    imageLoader_Index: Sprite = null!;
    @property(Label)
    tex_Name: Label = null!;
    @property(Label)
    tex_Time: Label = null!;
    @property(Label)
    index: Label = null!;
    onLoad() 
    {

    }

    public Init(cfg:TrLoveHistory,_index:number)
    {
        if (cfg == null)
            return;

        //imageLoader_Index.Path = DataTableManager.Instance.Tables.TbAtlas.GetOrDefault(cfg.TitleIcon).Path;
        this.tex_Name.string = cfg.Desc;
        this.index.string =  "0"+_index;
        //
        var isUnlock = GameData.PlayerData.GlobalData.PlayedVideoIdList.has(cfg.VideoIds[0]);
        this.tex_Time.node.active=isUnlock
        if (isUnlock)
		{
            this.tex_Time.string = GameData.PlayerData.GlobalData.PlayedVideoIdList.get(cfg.VideoIds[0])?.toString()!;
        }
    }
}