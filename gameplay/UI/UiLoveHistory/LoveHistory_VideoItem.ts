import { Sprite } from "cc";
import { Label } from "cc";
import { _decorator } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { TrLoveHistory } from "../../../schema/schema";
import { GameData } from "../../GameDataModel/GameData";
import ConfigManager from "../../../manager/Config/ConfigManager";
import { UITransform } from "cc";
import { ImageAsset } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { Texture2D } from "cc";
import { SpriteFrame } from "cc";

const { ccclass, property } = _decorator;

@ccclass('LoveHistory_VideoItem')
export class LoveHistory_VideoItem extends GameComponent 
{
    @property(Sprite)
    imageLoader_Index: Sprite = null!;

    @property([Label])
    tex_Name: Label[] = [];

    @property(UITransform)
    obj_LockName: UITransform = null!;

    @property(UITransform)
    obj_UnlockName: UITransform = null!;

    @property(UITransform)
    obj_VideoTip: UITransform = null!;
    private  Id:number=0;
    onLoad() 
    {

    }

    public Init(id:number,iconKey:string,isWide:boolean)
    {
        var videoCfg = ConfigManager.tables.TbVideo.get(id);
        if (videoCfg == null)
            return;
        this.name = id.toString();
        this.Id = id;
        var isUnlock = GameData.PlayerData.GlobalData.PlayedVideoIdList.has(id);
        this.obj_LockName.node.active = !isUnlock;
        this.obj_UnlockName.node.active = isUnlock;
        this.obj_VideoTip.node.active = isUnlock;
        for (const item of this.tex_Name) {
            item.string= videoCfg.Desc;
        }
        //
        var defaultIcon = isWide ? "Sprites/history_jw_d1" : "Sprites/history_jw_d2";
        if(isUnlock)
        {
            this.loadImage(ConfigManager.tables.TbAtlas.get(iconKey)?.Path!,this.imageLoader_Index)
        }
        else
        {
            this.loadImage(defaultIcon,this.imageLoader_Index)
        }
    }
        private async loadImage(urlPath: string, node: Sprite | null) {
            let image = await oops.res.loadAsync<ImageAsset>("UILoveHistory",urlPath);
            if (image && node != null) {
                const texture = new Texture2D();
                texture.image = image;
    
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;
                node.spriteFrame = spriteFrame;
            }
        }
}