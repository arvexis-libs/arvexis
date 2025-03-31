/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-08-29 13:37:08
 */
import { _decorator, sys } from "cc";
import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { JsonUtil } from "../../../../../extensions/oops-plugin-framework/assets/core/utils/JsonUtil";
import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { CCVMParentComp } from "../../../../../extensions/oops-plugin-framework/assets/module/common/CCVMParentComp";
import { GameEvent } from "../../common/config/GameEvent";
import { UIID } from "../../common/config/GameUIConfig";
import { smc } from "../../common/ecs/SingletonModuleComp";
import { TableRoleJob } from "../../common/table/TableRoleJob";
import { TableRoleLevelUp } from "../../common/table/TableRoleLevelUp";
import ConfigManager from "../../manager/Config/ConfigManager";
import { GameHelper } from "../../gameplay/GameTool/GameHelper";
import { UITimerManager } from "../../gameplay/Manager/UITimerManager";
import { UICallbacks } from "db://oops-framework/core/gui/layer/Defines";
import { Node } from "cc";
import { PlayerSystem } from "../../gameplay/Manager/PlayerSystem";
import { GameSaveManager } from "../../gameplay/GameSave/GameSaveManager";
import { Notification } from "../../common/UINotification/Notification";
import { SdkManager } from "../../../modules/sdk/SdkManager";
import { UINotificationManager } from "../../gameplay/Manager/UINotificationManager";
import { tips } from "../../common/prompt/TipsManager";
import { ProgressBar } from "cc";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { Label } from "cc";
import { UIMusicManager } from "../../gameplay/Manager/UIMusicManager";
import { StorySystem } from "../../gameplay/Manager/StorySystem";
import { GameDot } from "../../gameplay/Manager/GameDot";
import { GameData } from "../../gameplay/GameDataModel/GameData";

const { ccclass, property } = _decorator;

/**  */
@ccclass('LoadingViewComp')
@ecs.register('LoadingView', false)
export class LoadingViewComp extends CCComp {
    private progress: number = 0;

    @property(ProgressBar)
    mPrograssBar: ProgressBar = null!
    @property(Label)
    mPrompt: Label = null!
    @property(Node)
    Login: Node = null!
    @property(Node)
    Age: Node = null!
    reset(): void {

    }

    start() {
        if (!sys.isNative) {

        }
        this.enter();
    }

    enter() {
        this.Login.active = false;
        this.Age.active = false;
        this.addEvent();
        this.loadRes();
    }

    private addEvent() {
        this.on(GameEvent.LoginSuccess, this.onHandler, this);
        this.on(GameEvent.LoginFailed, this.onHandler, this);
    }

    private async onHandler(event: string, args: any) {
        switch (event) {
            case GameEvent.LoginSuccess:
                await GameSaveManager.Instance.load();
                console.log("");
                GameData.PlayerData.GlobalData.LoginCount += 1;

                GameDot.Instance.Init();
                GameDot.Instance.RegisterDot();
                GameDot.Instance.RoleDot();
                GameDot.Instance.LoginDot();
                this.openUIMain();
                //this.OpenUIHome();
                // 
                oops.gui.remove(UIID.Loading);
                break;
            case GameEvent.LoginFailed:
                tips.confirm("", () => {
                    smc.account.connect();
                }, "");
                break;
        }
    }

    private openUIMain()
    {
        oops.gui.open(UIID.MainVideo);
        oops.gui.open(UIID.UIMain);
    }

    /**  */
    private async loadRes() {
        this.mPrograssBar.progress = 0;
        await this.loadCustom();
        this.mPrograssBar.progress = 0.1;
        console.log("JSON ");
        await this.InitManager();
        this.mPrograssBar.progress = 0.2;
        console.log("mananger");
        //await this.loadBundles();
        await this.loadGameRes();
    }

    /** JSON */
    private async loadCustom() {
        // JSON
        this.mPrompt.string = "";//oops.language.getLangByID("loading_load_json");
        return new Promise(async (resolve, reject) => {
            console.log("");
            await ConfigManager.loadAllConfig();
            console.log("");
            resolve(null);
        });
    }
    /** **/
    private async InitManager() {
        this.mPrompt.string = "";
        return new Promise(async (resolve, reject) => {
            await SdkManager.inst.init();
            console.log("mananger");
            //
            GameHelper.Init();
            PlayerSystem.Instance.init();
            await UITimerManager.Instance.Init();
            await UINotificationManager.Instance.Init();
            await SdkManager.inst.init();
            await UIMusicManager.inst.init();
            Notification.RefreshAllRedPoint();
            StorySystem.Instance.Init();
            resolve(null);
        });
    }
    async loadBundles() {
        await oops.res.loadBundle("LoadableAssets/UIPhone");
        await oops.res.loadBundle("LoadableAssets/UIFitness");
    }

    /**  */
    private async loadGameRes() {
        // 
        //this.data.prompt = oops.language.getLangByID("loading_load_game");

        //oops.res.loadDir("game", this.onProgressCallback.bind(this), this.onCompleteCallback.bind(this));
        this.mPrompt.string = "";
        this.mPrograssBar.progress = 0.3;
        console.log("Audios");
        await oops.res.loadBundle("Audios");
        this.mPrograssBar.progress = 0.4;
        console.log("Art");
        await oops.res.loadBundle("Art");
        this.mPrograssBar.progress = 0.5;
        console.log("CommonRes");
        await oops.res.loadBundle("CommonRes");
        this.mPrograssBar.progress = 0.6;
        console.log("Sprites");
        await oops.res.loadBundle("Sprites");
        this.mPrograssBar.progress = 0.7;
        console.log("UIMainVideo");
        await oops.res.loadBundle("UIMainVideo");
        this.mPrograssBar.progress = 0.8;

        //
        console.log("UIStoryReward");
        await oops.res.loadBundle("UIStoryReward");
        await oops.res.loadDir("UIStoryReward");
        this.mPrograssBar.progress = 0.9;

        console.log("common");
        await oops.res.loadDir("common", this.onCompleteCallback.bind(this));
        console.log("common Complete");
    }

    /**  */
    private onCompleteCallback() {
        this.mPrograssBar.progress = 1.0;
        console.log("common Complete~~~~");
        this.mPrompt.string = ""//oops.language.getLangByID("loading_load_player");


        // 
        this.scheduleOnce(() => {
            this.ShowLogin();
        }, 0.2);
    }

    private ShowLogin() {
        this.mPrograssBar.node.active = false;
        this.Login.active = true;
    }

    //
    private LoginClick() {
        smc.account.connect();
    }

    //
    private TipsClick() {
        this.Age.active = !this.Age.active;
    }

    //
    private CloseClick() {
        this.Age.active = !this.Age.active;
    }
}