import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { CurrencyBarItemCom } from './CurrencyBarItemCom';
import { CurrencyShow, EItemClass } from '../gameplay/GameDataModel/GameEnum';
const { ccclass, property } = _decorator;

@ccclass('CurrencyBarCom')
export class CurrencyBarCom extends CCComp {

    @property(Label)
    currencyLabel:Label = null!

    @property(Array(CurrencyBarItemCom))
    currencyItems:CurrencyBarItemCom[] = []


    mCurrencyClass: EItemClass = null!

    protected onLoad(): void {


    }
    onAdded(args: any) {
        this.mCurrencyClass = args;
    }

    protected onEnable(): void {
        this.show();
    }

    private show(){
        let item = CurrencyShow[this.mCurrencyClass];
        if(item){
            this.currencyLabel.string = item.name;

            let maxShow = item.currency.length > this.currencyItems.length ? this.currencyItems.length : item.currency.length;
            for(let i = 0; i < maxShow; i++){
                this.currencyItems[i].node.active = true;
                this.currencyItems[i].show(item.currency[i]);
            }
            for(let i = maxShow; i < this.currencyItems.length; i++){
                this.currencyItems[i].node.active = false;
            }
        }
        else{
            console.error("");
        }
    }


    reset(): void {
        
    }
}


