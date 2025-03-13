/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2023-08-28 17:23:59
 */
import { Node, EventTouch, _decorator } from "cc";
import { oops } from "../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { LabelChange } from "../../../../extensions/oops-plugin-framework/assets/libs/gui/label/LabelChange";
import { UIID } from "../common/config/GameUIConfig";
import { smc } from "../common/ecs/SingletonModuleComp";
import { tips } from "../common/prompt/TipsManager";
import { RoleViewInfoComp } from "../role/view/RoleViewInfoComp";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import ConfigManager from "../manager/Config/ConfigManager";
import { ImageAsset } from "cc";
const { ccclass, property } = _decorator;
// 
@ccclass('Demo')
export class Demo extends GameComponent {
    private lang: boolean = true;

    @property(LabelChange)
    private labChange: LabelChange = null!;

    start() {
        // resLoader.dump();

        // console.log("", dynamicAtlasManager.atlasCount);
        // console.log("", dynamicAtlasManager.maxAtlasCount);
        // console.log("", dynamicAtlasManager.textureSize);
        // console.log("", dynamicAtlasManager.maxFrameSize);
        // console.log("", dynamicAtlasManager.maxFrameSize);

        // console.log("", sys.isNative);
        // console.log("", sys.isBrowser);
        // console.log("", sys.isMobile);
        // console.log("", sys.isLittleEndian);
        // console.log("", sys.platform);
        // console.log("", sys.language);
        // console.log("", sys.languageCode);
        // console.log("", sys.os);
        // console.log("", sys.osVersion);
        // console.log("", sys.osMainVersion);
        // console.log("", sys.browserType);
        // console.log(",  `sys.NetworkType.LAN`", sys.getNetworkType());
        // console.log(" 1", sys.getBatteryLevel());
        for (let item of ConfigManager.tables.TbItem.getDataList()) {
            //console.log(item);
        }

        this.aa();


        this.labChange.changeTo(0.5, 250, () => { })

        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private async aa()
    {
        let a = await oops.res.loadAsync<ImageAsset>("common/com_img_shadow");

        oops.res.load("common/com_img_shadow", ImageAsset, (err: Error | null, data: ImageAsset) => {

        });
    }

    private onTouchEnd(event: EventTouch) {
        switch (event.target.name) {
            case "oops-tutorial":
                window.open("https://store.cocos.com/app/detail/6647", '_blank');
                break;
            case "oops-net":
                window.open("https://store.cocos.com/app/detail/5877", '_blank');
                break;
            case "oops-guide":
                window.open("https://store.cocos.com/app/detail/3653", '_blank');
                break;
            case "oops-moba":
                window.open("https://store.cocos.com/app/detail/3814", '_blank');
                break;
            case "oops-war-chess":
                window.open("https://store.cocos.com/app/detail/5676", '_blank');
                break;
            case "oops-turn-battle":
                window.open("https://store.cocos.com/app/detail/7062", '_blank');
                break;
            case "oops-tiledmap":
                window.open("https://store.cocos.com/app/detail/4428", '_blank');
                break;
            case "oops-rpg-player3d":
                window.open("https://store.cocos.com/app/detail/4139", '_blank');
                break;
            case "oops-rpg-player2d":
                window.open("https://store.cocos.com/app/detail/3675", '_blank');
                break;
        }
    }

    private btn_long(event: EventTouch, data: any) {
        oops.gui.toast(data, true);
    }

    /**  */
    private btn_level_up(event: EventTouch, data: any) {
        var role = smc.account.AccountModel.role;
        role.upgrade();
    }

    /**  */
    private btn_attack(event: EventTouch, data: any) {
        var role = smc.account.AccountModel.role;
        role.attack();
    }

    /**  */
    private btn_change_job9(event: EventTouch, data: any) {
        var role = smc.account.AccountModel.role;
        role.changeJob(9);
    }

    /**  */
    private btn_change_job5(event: EventTouch, data: any) {
        var role = smc.account.AccountModel.role;
        role.changeJob(5);
    }

    /**  */
    private btn_change_job1(event: EventTouch, data: any) {
        var role = smc.account.AccountModel.role;
        role.changeJob(1);
    }

    /**  */
    private async btn_open_role_info(event: EventTouch, data: any) {
        var role = smc.account.AccountModel.role;
        var node = await oops.gui.openAsync(UIID.Demo_Role_Info, "");
        if (node) role.add(node.getComponent(RoleViewInfoComp)!);
    }

    /**  */
    private btn_language(event: EventTouch, data: any) {
        console.log(oops.language.getLangByID("notify_show"));

        if (this.lang == false) {
            this.lang = true;
            oops.language.setLanguage("zh", () => { });
        }
        else {
            this.lang = false;
            oops.language.setLanguage("en", () => { });
        }
    }

    /**  */
    private btn_common_prompt(event: EventTouch, data: any) {
        tips.test(() => {

        });
        tips.test(() => {

        });
        tips.confirm("1", () => {

        }, "1");
        tips.confirm("2", () => {

        }, "2");
    }

    /**  */
    private btn_notify_show(event: EventTouch, data: any) {
        oops.gui.toast("common_prompt_content", true);
    }

    /**  */
    private netInstableOpen(event: EventTouch, data: any) {
        oops.gui.waitOpen();
        setTimeout(() => {
            oops.gui.waitClose();
        }, 2000);
    }

    /**  */
    private btn_audio_open1(event: EventTouch, data: any) {
        oops.audio.volumeMusic = 0.5;
        oops.audio.playMusicLoop("audios/nocturne");
    }

    /**  */
    private btn_audio_open2(event: EventTouch, data: any) {
        oops.audio.playEffect("audios/Gravel");
    }
}
