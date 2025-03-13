import { _decorator, Component, Node, Label, Button, instantiate } from 'cc';
import { GameComponent } from 'db://oops-framework/module/common/GameComponent';
import { TrLoveHistory } from '../../../schema/schema';
import { UITransform } from 'cc';
import {PlayerSystem} from '../../Manager/PlayerSystem';
import ConfigManager from '../../../manager/Config/ConfigManager';
import { ScrollView } from 'cc';
import { Sprite } from 'cc';
import { math } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../../../common/config/GameUIConfig';
import { LoveHistory_Title } from './LoveHistory_Title';
import { LoveHistory_Line } from './LoveHistory_Line';
import { LoveHistory_Video } from './LoveHistory_Video';

const { ccclass, property } = _decorator;

@ccclass('UILoveHistoryRootView')
export class UILoveHistoryRootView extends GameComponent 
{
    private showStepList: TrLoveHistory[] = [];
    @property(Sprite)
    pro: Sprite = null!;
    @property(Node)
    obj_CurILv: Node = null!;
    @property(Node)
    tempRoot: Node = null!;
    @property(ScrollView)
    ScrollView: ScrollView = null!;
    @property(Node)
    proBg: Node = null!;
    @property(Label)
    lv: Label = null!;
    onLoad() {

    }

    start() {

    }
    onEnable() {
        this.Clear();
        this.loadPlayerCfg();
        this.loadAllItem();
        this.loadPro();
    }
    protected update(dt: number): void {
        if (!this.pro) return;

        const rectTrans = this.pro.getComponent(UITransform)!;
        const offset = rectTrans.height * this.pro.fillRange;
        
        if (Math.abs(offset - this.obj_CurILv.getPosition().y) > 0.01) {
            this.setCurProImg();
        }
    }

    private loadPlayerCfg(): void {
        const curPlayer = PlayerSystem.Instance.CurPlayId;
        const cfgs = ConfigManager.tables.TbLoveHistory.getDataList();
        if (!cfgs) return;
        this.showStepList=[]

        for (const item of cfgs) {
            if(item.Id==curPlayer)
            {
                this.showStepList.push(item);
            }
           
        }
    }

    private loadAllItem(): void {
        if (this.showStepList.length <= 0) return;
        
        let index = 1;
        for (const item of this.showStepList) {
            if (item.ShowType >= this.tempRoot.children.length) {
                console.error(`Invalid ShowType for id:${item.Id}, step:${item.Step}`);
                continue;
            }

            const tempNode = this.tempRoot.children[item.ShowType];
            const newNode = instantiate(tempNode);
            newNode.parent = this.ScrollView.content?.getChildByName("layout")!;
            newNode.active = true;

            switch (item.ShowType) {
                case 0:
                    newNode.getComponent(LoveHistory_Title)!.Init(item, index);
                    index++;
                    break;
                case 1:
                case 2:
                    newNode.getComponent(LoveHistory_Line)!.Init(item.LineNum);
                    break;
                case 3:
                    newNode.getComponent(LoveHistory_Video)!.init(item);
                    break;
            }
        }
        this.ScrollView.scrollToBottom();
    }

    private loadPro(): void {
        this.proBg.setSiblingIndex(-1);
        const curLv = PlayerSystem.Instance.CurLv;
        const endCfg = this.showStepList[this.showStepList.length - 1];

        if (endCfg.ProLevel > 0 && curLv >= endCfg.ProLevel) {
            this.pro.fillRange =1; //endCfg.ProValue;
            return;
        }

        let lastLvCfg: TrLoveHistory | null = null;
        for (const cfg of this.showStepList) {
            if (cfg.ProLevel > 0 && curLv >= cfg.ProLevel) {
                lastLvCfg = cfg;
            }

            if (cfg.ProLevel > 0 && curLv < cfg.ProLevel && lastLvCfg) {
                const addOnce = (cfg.ProValue - lastLvCfg.ProValue) / (cfg.ProLevel - lastLvCfg.ProLevel);
                const add = (curLv - lastLvCfg.ProLevel) * addOnce;
                this.pro.fillRange = (lastLvCfg.ProValue + add);
                return;
            }
        }
    }

    private setCurProImg(): void {
        const rectTrans = this.pro.getComponent(UITransform)!;
        const offset = rectTrans.height * this.pro.fillRange;
        this.obj_CurILv.setPosition(
            this.obj_CurILv.position.x,
            offset
        );
        this.lv.string = `Lv.${PlayerSystem.Instance.CurLv}`;
    }

    private Clear(): void {
        const content = this.ScrollView.content!;
        for (let i = content.children.length - 1; i = 0; i--) 
        {
            content.children[i].destroy();
        }
        
    }

    private onClickClose(): void {
        oops.gui.remove(UIID.UILoveHistoryRootView)
    }
}
