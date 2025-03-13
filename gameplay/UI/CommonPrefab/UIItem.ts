import { Sprite } from "cc";
import { _decorator } from "cc";
import { Label } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import ConfigManager from "../../../manager/Config/ConfigManager";
import { Utility } from "../../Utility/Utility";
import { oops } from "db://oops-framework/core/Oops";

const { ccclass, property } = _decorator;

@ccclass('UIItem')
export default class UIItem extends GameComponent{
    //  (Cocos Creator )
    @property(Label) 
    private m_Tex_Num: Label = null!;  // 

    @property(Label)
    private m_Tex_Name: Label = null!; // 

    @property(Sprite) 
    private imageLoader: Sprite = null!; //  Sprite 

    public Init1(itemId:number,  num:number)
	{
        this.init(itemId, num, true);
    }

    /**
     *  ( Cocos API)
     * @param itemId -  ID
     * @param num -  ( 0)
     * @param showName -  ( true)
     */
    public  async init(itemId: number, num: number, showName: boolean = true,bundleName:string=oops.res.defaultBundleName) {
        const cfg = ConfigManager.tables.TbItem.get(itemId);
        if (!cfg) {
            return;
        }

        // 
        this.m_Tex_Name.string = cfg.Name;
        this.m_Tex_Name.node.active = showName;

        //  (1)
        const hasMulti = Number(num) > 1;
        this.m_Tex_Num.node.active = hasMulti;
        this.m_Tex_Num.string = this._formatBigNumber(num);

        let spF = await Utility.loadImage(cfg.Icon,bundleName);
        if (spF) {
            this.imageLoader.spriteFrame = spF
        }
        // 
        if (itemId > 1 && itemId <= 6) {
            this.m_Tex_Name.string = `${cfg.Name}+1`;
        }
    }

    /**  () */
    private _formatBigNumber(num: number): string {
        // 
        return Utility.FormatBigNumber(num);
    }
}
