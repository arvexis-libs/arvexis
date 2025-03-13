import { Sprite } from "cc";
import { Label } from "cc";
import { _decorator } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { TrLoveHistory } from "../../../schema/schema";
import { GameData } from "../../GameDataModel/GameData";
import { UITransform } from "cc";
import { LoveHistory_VideoItem } from "./LoveHistory_VideoItem";

const { ccclass, property } = _decorator;

@ccclass('LoveHistory_Video')
export class LoveHistory_Video extends GameComponent {
    public OneHeight: number = 310;
    public MultipeHeigth: number = 350;
    public init(cfg: TrLoveHistory): void {
        if (!cfg) return;
        const num = cfg.VideoIds.length;
        if (num <= 0) {
            console.error(`Video, id:${cfg.Id}, step:${cfg.Step}`);
            return;
        }
        // 
        for (let i = 0; i < this.node.children.length; i++) {
            const child = this.node.children[i];

            // i
            if (i === num - 1) {
                child.active = true;

                // 
                const items = child.getComponentsInChildren(LoveHistory_VideoItem);
                for (let j = 0; j < items.length; j++) {
                    if (cfg.VideoIds[j] && cfg.VideoIcons[j]) {
                        items[j].Init(cfg.VideoIds[j], cfg.VideoIcons[j], num === 1);
                    }
                }
                // 
                const lvTip = child.getChildByName("lvTip");
                if (lvTip) {
                    if (cfg.IsShowLevel > 0) {
                        lvTip.active = true;
                        const labelNode = lvTip.children[1];
                        if (labelNode) {
                            const label = labelNode.getComponent(Label)!;
                            label.string = `Lv.${cfg.ProLevel}`;
                        }
                    } else {
                        lvTip.active = false;
                    }
                }
            } else {
                child.active = false;
            }
        }
        // 
        const rectTrans = this.node.getComponent(UITransform)!;
        rectTrans.setContentSize(
            rectTrans.width,
            num === 1 ? this.OneHeight : this.MultipeHeigth
        );
    }

}