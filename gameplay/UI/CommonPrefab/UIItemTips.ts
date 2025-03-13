import { Color, Event, EventMouse, tween, UITransform } from 'cc';
import { Vec2 } from 'cc';
import { _decorator, Component, Node, Label, Vec3, Sprite, RichText, Layout } from 'cc';
import { oops } from '../../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { CCComp } from '../../../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { UIID } from '../../../common/config/GameUIConfig';
import ConfigManager from '../../../manager/Config/ConfigManager';
import { DataTable } from '../../../schema/schema';
const { ccclass, property } = _decorator;

@ccclass('UIItemTips')
export class UIItemTips extends CCComp {
    reset(): void {
    } 

    @property(Node)
    mask: Node = null!;
    @property(Sprite)
    bg: Sprite = null!;
    @property(Label)
    title: Label = null!;
    @property(Label)
    desc: Label = null!;

    cfg : DataTable.Item = null!;
    pos : Vec2 = null!;
    onAdded(args : any){
        this.cfg = ConfigManager.tables.TbItem.get(args.id)!;
        this.pos = this.convertWorldPosToUIPos(args.pos) ;
    }

    start(){
        if(this.cfg == null){
            oops.gui.remove(UIID.UIItemTips);
            return;
        }
        this.title.string = this.cfg.Name;
        this.desc.string =  this.cfg.Desc.replace(/\\n/g,"\n"); //
        this.bg.color = new Color(0,0,0,0);
        //
        this.scheduleOnce(()=>{
            this.refreshPos();
        },0.1);

        this.mask.on(Node.EventType.TOUCH_START,this.onTouchStartMask.bind(this));
        this.mask.on(Node.EventType.TOUCH_END,this.onTouchStartMask.bind(this));
    }

     onTouchStartMask(event : EventMouse){
        event.preventSwallow = true;
        tween(this.bg).to(0.15,{color : new Color(0,0,0,0)}).call(()=>
        {
            oops.gui.remove(UIID.UIItemTips);
        }).start();
     }

     onTouchEndMask(event : EventMouse){
        event.preventSwallow = false;
     }

    offsetX : number = 110;     //bg,,10
    refreshPos(){
        const screenW = oops.gui.root.w;
        const screenH = oops.gui.root.h;
        const uiW = 640;
        let uiH = this.bg.node.size.height;
        
        //
        if(this.pos.x + uiW - this.offsetX > screenW / 2){
            //
            this.offsetX = uiW - (this.pos.x + screenW / 2);
            if(this.offsetX < 0)
                this.offsetX = 0;

            this.bg.node.setPosition(this.pos.x - uiW / 2 + this.offsetX, this.pos.y, 0);
        }
        else{
            //
            this.offsetX = uiW - (Math.abs(this.pos.x) + screenW / 2);
            if(this.offsetX < 0)
                this.offsetX = 0;
            this.bg.node.setPosition(this.pos.x + uiW / 2 - this.offsetX, this.pos.y, 0);
        }

        if(this.pos.y - uiH < -screenH / 2){
            //
            this.bg.node.setPosition(this.bg.node.position.x, this.pos.y + uiH / 2, 0);
        }
        else{
            this.bg.node.setPosition(this.bg.node.position.x, this.pos.y - uiH / 2, 0);
        }

        tween(this.bg).to(0.15,{color : Color.WHITE}).start();
    }

    onClickClose(){
        oops.gui.remove(UIID.UIItemTips);
    }

    // 3DUI
    convertWorldPosToUIPos(worldPos: Vec3): Vec2 {
        // Canvas
        const uiPos = new Vec3();
        oops.gui.root.getComponent(UITransform)!.convertToNodeSpaceAR(
            new Vec3(worldPos.x, worldPos.y, 0),
            uiPos
        );
        
        return new Vec2(uiPos.x, uiPos.y);
    }
}


