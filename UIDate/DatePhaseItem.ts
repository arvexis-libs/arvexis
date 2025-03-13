import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { DateItem } from './DateItem';
const { ccclass, property } = _decorator;

@ccclass('DatePhaseItem')
export class DatePhaseItem extends CCComp {

    @property(Prefab)
    dateItemPrefab: Prefab = null!

    @property(Label)
    phaseName: Label = null!
    @property(Node)
    phaseNode: Node = null!

    mPhaseId:number = 0
    
    reset(): void {
        
    }

    show(phaseId:number,phaseName:string, dateDataList:number[]): void {

        this.mPhaseId = phaseId;
        this.phaseName.string = phaseName;
        
        for(let i = 0; i < dateDataList.length; i++){
            let itemNode = instantiate(this.dateItemPrefab);
            let item = itemNode.getComponent(DateItem)!;
            item.showItem(dateDataList[i]);
            itemNode.parent = this.phaseNode;
        }
    }
}


