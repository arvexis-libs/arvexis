import { _decorator, Component, Node } from 'cc';
import { UIID } from 'db://assets/script/game/common/config/GameUIConfig';
import { oops } from 'db://oops-framework/core/Oops';
import { Label } from 'cc';
import TipHelper from 'db://assets/script/modules/Utils/NodeExtend/TipHelper';
import { HeroineDataManager } from 'db://assets/script/game/UIMain/HeroineDataManager';
import { Sprite } from 'cc';
import { LevelDetail } from './LevelDetail';
const { ccclass, property } = _decorator;

@ccclass('UIHeroineInfo')
export class UIHeroineInfo extends Component {
    @property({type: Label})
    nameLabel: Label = null!;

    @property({type: Label})
    lvLabel: Label = null!;

    @property({type: Label})
    expLabel: Label = null!;

    @property({type: Sprite})
    progress: Sprite = null!;

    @property({type: LevelDetail})
    levelDetail: LevelDetail = null!;

    start() {
        this.nameLabel.string = HeroineDataManager.Instance.GetName();
        this.lvLabel.string = `LV${HeroineDataManager.Instance.getLvCur()}`;
        const curExp = HeroineDataManager.Instance.GetExpCur();
        const nextExp = HeroineDataManager.Instance.GetExpCurLvNeep();
        this.expLabel.string = `${curExp}/${nextExp}`;
        this.progress.fillRange = curExp / nextExp;
        this.levelDetail.node.active = false;
    }

    onClose() {
        oops.gui.remove(UIID.UIHeroineInfo);
    }

    onEdit() {
        TipHelper.showDevTip();
    }

    /**  */
    async onLevelDetail() {
        console.log("[UIHeroineInfo]onLevelDetail");
        if (!this.levelDetail.node.active) {
            await this.levelDetail.refresh();
        }
        this.levelDetail.node.active = !this.levelDetail.node.active;
    }

    onClickEmpty() {
        if (!this.levelDetail.node.active) return;
        this.levelDetail.node.active = false;
    }
}