import { Label, instantiate, SpriteFrame} from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from "db://oops-framework/module/common/CCComp";
import ConfigManager from "../manager/Config/ConfigManager";
import{TrIdentity} from '../schema/schema';
import { HeroineDataManager } from '../UIMain/HeroineDataManager';
import { oops } from 'db://oops-framework/core/Oops';
import { Utility } from '../gameplay/Utility/Utility';
import { UIIdentity } from '../UIIdentity/UIIdentity';
const { ccclass, property } = _decorator;

@ccclass('IdentityCard')
export class IdentityCard extends Component
{
    @property(Label)TxtName: Label = null!;
    @property(Label)TxtDesc: Label = null!;
    @property(Label)TxtSpecPropName: Label = null!;
    @property(Label)TxtCompleteProcess: Label = null!;//
    @property(Sprite)IconSpecProp: Sprite = null!;
    @property(Sprite)IconIndent: Sprite = null!;
    @property(Node)ArrFeature: Node[] = [];//
    @property(Node)Container: Node = null!;//
    @property(Node)FeatureItem: Node = null!;
    public trIndentity: TrIdentity = null!;
    protected onLoad(): void {
    }

    Refresh() {
        this.setName(this.trIndentity.Name)
        this.setDesc(this.trIndentity.Desc)
        this.setSpecPropName()
        this.setSpecPropIcon();
        this.setFeature();
        this.setIconIndent();
        console.error(this.node.name)
    }
    
    setName(name: string)
    {
        this.TxtName.string = name;

    }

    setDesc(desc: string)
    {
        this.TxtDesc.string = desc;

    }
     
    setSpecPropIcon()
    {
        let propId = this.trIndentity.TendProp;
        let propIconRes = HeroineDataManager.Instance.GetPropIcon(propId)
        
        oops.res.loadAsync<SpriteFrame>("CommonRes", `${propIconRes}/spriteFrame`).then((sp)=>{
            this.IconSpecProp.spriteFrame = sp;
        });
    }
    setSpecPropName()
    {
        let propId = this.trIndentity.TendProp;
        this.TxtSpecPropName.string = HeroineDataManager.Instance.GetPropName(propId);

    }

    setCompleteProcess(completeProcess:number)
    {
        this.TxtCompleteProcess.string = completeProcess.toString();
    }

    setFeature()
    {
        this.Container.removeAllChildren();
        let arr = this.getArrFeatureData();
        for (let i = 0; i < arr.length; i++) {
            const element = arr[i];
            let clone = instantiate(this.FeatureItem);
            clone.parent = this.Container;
            clone.active = true;
            clone.getChildByName("Name")!.getComponent(Label)!.string = element[0];
            let sprite = clone.getChildByName("Level")!.getComponent(Sprite)!
            oops.res.loadAsync<SpriteFrame>("UIIdentity", `Sprites/${element[2]}/spriteFrame`).then(res => { 
                sprite.spriteFrame = res;
            });
        }
    }
    setIconIndent()
    {
        oops.res.loadAsync<SpriteFrame>("UIIdentity", `Sprites/${this.trIndentity.Icon}/spriteFrame`).then(res => { 
            this.IconIndent.spriteFrame = res;
        });
    }

    private getArrFeatureData()
    {
        let arr = [];
        if (this.trIndentity.Feature1 && this.trIndentity.Feature1.length>0) {
            arr.push(this.trIndentity.Feature1);
        }
        if (this.trIndentity.Feature2 && this.trIndentity.Feature2.length>0) {  
            arr.push(this.trIndentity.Feature2);
        }
        if (this.trIndentity.Feature3 && this.trIndentity.Feature3.length>0) {  
            arr.push(this.trIndentity.Feature3);
        }
        if (this.trIndentity.Feature4 && this.trIndentity.Feature4.length>0) {  
            arr.push(this.trIndentity.Feature4);
        }
        if (this.trIndentity.Feature5 && this.trIndentity.Feature5.length>0) {  
            arr.push(this.trIndentity.Feature5);
        }
        
        return arr
    }
}