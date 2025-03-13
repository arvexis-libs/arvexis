import {
    Node, EventTouch, _decorator, Component, Button, Vec3, Vec2, tween, Tween, UIOpacity,
    CCInteger, CCString, CCBoolean, CCFloat, log, error, input, NodePool, instantiate, Prefab, UITransform, director
} from "cc";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "db://assets/script/game/common/config/GameUIConfig";
import { GameData } from "db://assets/script/game/gameplay/GameDataModel/GameData";
import { PlayerSystem } from "db://assets/script/game/gameplay/Manager/PlayerSystem";
import { Utility } from "db://assets/script/game/gameplay/Utility/Utility";
import { GameEvent } from "../common/config/GameEvent";
import { Toggle } from "cc";
import { Sprite } from "cc";
import ConfigManager from "../manager/Config/ConfigManager";
import { ScrollView } from "cc";
import { find } from "cc";
import { SpriteFrame } from "cc";
import { Texture2D } from "cc";
import { ImageAsset } from "cc";
import { TrStoryLine } from "../schema/schema";
import { count } from "console";
import { Label } from "cc";
import { UIMainVideoComp } from "../UIMainVideo/UIMainVideoComp";
import { tips } from "../common/prompt/TipsManager";
import { TipsNoticeUtil } from "../gameplay/Utility/TipsNoticeUtil";
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { StorySystem } from "../gameplay/Manager/StorySystem";
const { ccclass, property } = _decorator;

/**  */
@ccclass('UIStoryLine')
export class UIStoryLine extends CCComp {

    @property({ type: Sprite })
    private bg: Sprite = null!;
    @property({ type: Node })
    private closeBtn: Node = null!;
    @property({ type: Node })
    private switchBtn: Node = null!;
    @property({ type: Label })
    private npcName: Label = null!;

    @property({ type: Node })
    private scroll: Node = null!;
    @property({ type: Node })
    private content: Node = null!;
    @property({ type: Node })
    private templet: Node = null!;


    @property(Node)
    proBg: Node = null!;
    @property(Sprite)
    pro: Sprite = null!;
    @property(ScrollView)
    ScrollView: ScrollView = null!;

    private curNpcId: number = 0;
    private isHaveCurLv: boolean = false;
    private itemCount: number = 0;
    private curItemY: number = 0;
    private ItemHeight: number = 438;

    reset(): void {

    }
    start(): void {
        this.curNpcId = PlayerSystem.Instance.CurPlayId;
        this.refresh();
    }
    protected onLoad(): void {
        this.closeBtn.on(Button.EventType.CLICK, this.onClose, this);
        this.switchBtn.on(Button.EventType.CLICK, this.onSwitch, this);

        this.on(GameEvent.UIStoryLineRefresh, this.UIStoryLineRefresh, this);
        UIMusicManager.inst.playUIMusic(UIID.UIStoryLine, 1002);

    }
    onDestroy() {
        this.off(GameEvent.UIStoryLineRefresh);
    }
    private onClose(): void {
        oops.gui.remove(UIID.UIStoryLine)
    }
    private onSwitch(): void {
        oops.gui.openAsync(UIID.UIStoryLineSwitch)
    }

    private UIStoryLineRefresh(event: string, NpcId: number): void {
        if (!NpcId) {
            this.refresh();
            return;
        }

        if (NpcId != this.curNpcId) {
            this.curNpcId = NpcId;
            this.refresh();
        }
    }

    private async refresh(): Promise<void> {
        this.Clear();
        this.loadAllItem();

        const name = ConfigManager.tables.TbPlayer.get(this.curNpcId)?.Name!;
        this.npcName.string = name;

        const path = ConfigManager.tables.TbPlayer.get(this.curNpcId)?.StoryLinePic;
        let spF = await Utility.loadImage("Sprites/Head/" + path, "UIStoryLine");
        if (spF) {
            this.bg.spriteFrame = spF;
        }
    }


    private SetClick(node: Node, data : TrStoryLine): void {
        node.off(Button.EventType.CLICK);
        // console.error(" " + data.Name + data.StoryId);

        if  (StorySystem.Instance.IsLookComplete(data.StoryId)) {
            node.on(Button.EventType.CLICK, () => {
                
                // console.error(data.Name + data.StoryId);
                tips.confirm("", () => {
                    this.scheduleOnce(() => {
                        StorySystem.Instance.Play(data.StoryId);
                    }, 0.5);
                    // StorySystem.Instance.Play(data.StoryId);
                }, "", () => { 
                    
                }, "", true);

                

            }, this);
        }
        else
        {
            node.on(Button.EventType.CLICK, () => {
                TipsNoticeUtil.PlayNotice("");
            }, this);
        }

    }   

    private curItemCount = 0;
    private startLv = 0;
    private endLv = 0;

    private async loadAllItem(): Promise<void> {
        const cfgs = ConfigManager.tables.TbStoryLine.getDataList();
        if (!cfgs) return;
        let cfgData = cfgs.slice().reverse();
        for (const data of cfgs) {
            if (data.NpcID == this.curNpcId) {
                this.startLv = data.Lv;
                break;
            }
        }

        for (const data of cfgData) {
            if (data.NpcID == this.curNpcId) {
                this.endLv = data.Lv;
                break;
            }
        }

        let index = 0;
        let itemId = 0; // 
        let itemLv = 0; // 
        let curNode: Node = null!;
        let curItem: Node = null!;
        let lastLvStart = 0;
        let topY = 0;
        for (const data of cfgData) {
            if (data.NpcID != this.curNpcId) {
                index++;
                continue
            }

            let MultiLine = data.Id % 10 > 1;
            // 
            if (data.Lv != itemLv || Math.floor(itemId / 100) != Math.floor(data.Id / 100)) {
                itemId = data.Id;
                const newNode = instantiate(this.templet);
                newNode.parent = this.content;
                curNode = newNode;
                let item = find("itemRoot/item", curNode)!;
                curItem = item;
                this.itemCount++;
                // this.SetClick(item, data);
            }
            else {
                let newItem = instantiate(curItem);
                newItem.parent = curItem.parent;
                curItem = newItem;
                MultiLine = true;
                // this.SetClick(newItem, data);
            }
            itemLv = data.Lv;

            // item

            const itemName = find("name", curItem)?.getComponent(Label)!;
            if (!itemName) {
                console.error( "continue" + data.Id)

                continue;
            }
            itemName.string = data.Name;

            // console.error( data.Lv + " / " + data.Id)

            let linename = "line";

            // pass
            let pass = StorySystem.Instance.IsLookComplete(data.StoryId);
            // pass = true;
            linename += pass ? "1" : "2";
            const mask = find("mask", curItem)!;
            mask.active = !pass;

            if (pass) {
                if (topY == 0) {
                    topY = this.itemCount;
                }
            }
            //     curItem.on(Button.EventType.CLICK, () => {
            //         tips.confirm("", () => {
            //             StorySystem.Instance.Play(data.StoryId);
            //             // PlayerSystem.Instance.PlayVideo(data.StoryId);
            //         }, "", () => { }, "", true);
            //     }, this);
            // }
            // else {
            //     curItem.on(Button.EventType.CLICK, () => {
            //         TipsNoticeUtil.PlayNotice("");
            //     }, this);
            // }
            this.SetClick(curItem, data);

            // line
            if (data.Lv > this.startLv || itemId != 101) {

                // direction
                let nextMultiLine = false;
                if (index + 1 < cfgData.length) {
                    nextMultiLine = cfgData[index + 1].Id % 10 > 1;//&& cfgData[index + 1].Lv != data.Lv;
                }
                if (MultiLine) {
                    linename += data.Id % 10 == 1 ? "R" : "L";
                }
                else if (nextMultiLine) {

                }
                // console.error(data.Name + " / " + cfgData[index + 1].Id + " / " + cfgData[index + 1].Id % 10)

                // 1.1
                if (!nextMultiLine) {
                    const lineNode = find("line/" + linename, curNode)!;
                    lineNode.active = true;

                    lineNode.scale_y = -lineNode.scale_y;
                }
                // 2.2
                else {
                    const lineNode1 = find("line/" + linename + "L", curNode)!;
                    lineNode1.active = true;
                    const lineNode2 = find("line/" + linename + "R", curNode)!;
                    lineNode2.active = true;

                    // lineNode1.scale_y = -lineNode1.scale_y;
                    // lineNode2.scale_y = -lineNode2.scale_y;
                }
            }

            // tag lv
            const curLv = PlayerSystem.Instance.GetPlayerData(data.NpcID).level;
            // const curLv = 30;

            if (itemId == 101) {

                if (data.Lv == curLv) {
                    if (!this.isHaveCurLv) {
                        const tip = find("tag/tip", curNode)!;
                        tip.active = MultiLine;

                        const curLvT = find("tag/curLvT", curNode)!;
                        curLvT.active = true;
                        const lv = find("lv", curLvT)!.getComponent(Label)!;
                        lv.string = "Lv." + curLv.toString();

                        this.isHaveCurLv = true;
                        this.curItemCount = -1;
                        for (const data2 of cfgs) {
                            if (data2.NpcID != this.curNpcId)
                                continue

                            if (curLv >= data2.Lv && data2.Id % 100 == 1) {
                                this.curItemCount++;
                            }

                            if (data.Lv == data2.Lv && data2.Id == 101) {
                                break;
                            }
                        }

                        this.curItemY = this.curItemCount * this.ItemHeight;
                    }
                }
                else {
                    const otherLvT = find("tag/otherLvT", curNode)!;
                    otherLvT.active = true;
                    const lv = find("lv", otherLvT)!.getComponent(Label)!;
                    lv.string = "Lv." + data.Lv.toString();

                    if (!this.isHaveCurLv && data.Lv < curLv) {
                        const tip = find("tag/tip", curNode)!;
                        tip.active = MultiLine;

                        const curLvT = find("tag/curLvT", curNode)!;
                        curLvT.active = true;
                        const lv = find("lv", curLvT)!.getComponent(Label)!;
                        lv.string = "Lv." + curLv.toString();

                        let itemCount = 0;
                        for (const data2 of cfgs) {
                            if (data2.NpcID != this.curNpcId)
                                continue

                            if (data.Lv == data2.Lv && data2.Id % 100 == 1) {
                                // console.error(`${data2.Lv} ${data2.Id} ${data2.Name}`);
                                itemCount++;
                            }
                        }

                        let h = curLvT.getPosition().y;
                        if (curLv > this.endLv) {
                            h += 100;
                        } else {
                            let v = (curLv - data.Lv) / (lastLvStart - data.Lv);
                            h += itemCount * this.ItemHeight * v;
                        }
                        curLvT.setPosition(curLvT.position.x, h);

                        this.isHaveCurLv = true;

                        this.curItemCount = -1;
                        for (const data2 of cfgs) {
                            if (data2.NpcID != this.curNpcId)
                                continue

                            if (curLv >= data2.Lv && data2.Id % 100 == 1) {
                                this.curItemCount++;
                            }

                            if (data.Lv == data2.Lv && data2.Id == 101) {
                                break;
                            }
                        }
                        this.curItemY = this.curItemCount * this.ItemHeight + h;
                    }
                    lastLvStart = data.Lv;
                }
            }

            // 
            if (curLv < this.startLv) {
                if (this.startLv == data.Lv && data.Id == 101) {
                    const curLvT = find("tag/curLvT", curNode)!;
                    curLvT.active = true;
                    const lv = find("lv", curLvT)!.getComponent(Label)!;
                    lv.string = "Lv." + curLv.toString();

                    let h = this.ItemHeight * 0.5 * (curLv / data.Lv - 1);
                    curLvT.setPosition(curLvT.position.x, curLvT.position.y + h);
                }
            }

            curNode.active = true;
            index++;

            if (data.Lv == this.startLv && itemId == 101) {
                this.loadPro();
            }

            const itemIcon = find("itemRoot/item/icon", curNode)?.getComponent(Sprite)!;
            curItem.active = true;
            let spF = await Utility.loadImage("Sprites/Icon/" + data.Icon, "UIStoryLine");
            if (spF) {
                itemIcon.spriteFrame = spF;
            }

        }
        // this.ScrollView.scrollToTop();

        let pos = new Vec2(0, 0);
        pos.y = this.ItemHeight * Math.max(0, topY - 1);

        this.ScrollView.scrollToOffset(pos);
    }


    private loadPro(): void {
        const h = this.ItemHeight;
        this.proBg.setSiblingIndex(-1);

        let len = this.itemCount * h;
        this.scroll.getComponent(UITransform)!.height = len;
        this.proBg.getComponent(UITransform)!.height = len;
        const curLv = PlayerSystem.Instance.GetPlayerData(this.curNpcId).level;
        // const curLv = 30;
        if (curLv >= this.startLv)
            this.pro.getComponent(UITransform)!.height = this.curItemY + this.ItemHeight * 0.5;
        else {
            this.pro.getComponent(UITransform)!.height = this.ItemHeight * 0.5 * (curLv / this.startLv);
        }
    }


    private Clear(): void {
        const content = this.content!;
        let len = content.children.length;
        for (let i = 0; i < len; i++) {
            content.children[i].destroy();
        }

        this.isHaveCurLv = false;
        this.itemCount = 0;
        this.curItemY = 0;
    }

}