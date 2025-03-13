/*
 * @Author: dgflash
 * @Date: 2022-04-15 14:44:04
 * @LastEditors: dgflash
 * @LastEditTime: 2022-08-29 14:13:42
 */
import { _decorator, Component, game, sys } from "cc";
import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { UIID } from "../../common/config/GameUIConfig";
import { tips } from "../../common/prompt/TipsManager";
import { Hot, HotOptions } from "./Hot";
import { LoadingViewComp } from "./LoadingViewComp";

const { ccclass, property } = _decorator;

/**  */
@ccclass('HotUpdate')
export class HotUpdate extends Component {
    /**  */
    private hot = new Hot();
    /** UI */
    private lv: LoadingViewComp = null!;

    onLoad() {
        if (sys.isNative) {
            this.lv = this.getComponent(LoadingViewComp)!;
            //this.lv.data.prompt = oops.language.getLangByID("update_tips_check_update");
            this.startHotUpdate();
        }
    }

    /**  */
    private startHotUpdate() {
        let options = new HotOptions();
        options.onVersionInfo = (data: any) => {
            // console.log(`:${data.local},:${data.server}`);
        };
        options.onUpdateProgress = (event: jsb.EventAssetsManager) => {
            // 
            let pc = event.getPercent();
            let _total = event.getTotalBytes();
            let _have = event.getDownloadedBytes();

            let total: string, have: string;
            if (_total < 1048576) {                              // 1mkb
                _total = Math.ceil(_total / 1024)
                total = _total + 'K'
            }
            else {                                               // m
                total = (_total / (1024 * 1024)).toFixed(1);
                total = total + 'M'
            }

            if (_have < 1048576) {                               // 1mkb
                _have = Math.ceil(_have / 1024)
                have = _have + 'K'
            }
            else {                                               // m
                have = (_have / (1024 * 1024)).toFixed(1);
                have = have + 'M'
            }

            if (total == '0K') {
                //this.lv.data.prompt = oops.language.getLangByID("update_tips_check_update");
            }
            else {
                //this.lv.data.prompt = oops.language.getLangByID("update_tips_update") + have + '/' + total + ' (' + parseInt(pc * 100 + "") + '%)';
            }

            // 
            if (!isNaN(event.getPercent())) {
                //this.lv.data.finished = event.getDownloadedFiles();
                //this.lv.data.total = event.getTotalFiles();
                //this.lv.data.progress = (event.getPercent() * 100).toFixed(2);
            }
        };
        options.onNeedToUpdate = (data: any, totalBytes: number) => {
            //this.lv.data.prompt = oops.language.getLangByID("update_tips_new_version");
            let total: string = "";
            if (totalBytes < 1048576) {                                 // 1mkb
                // totalBytes = Math.ceil(totalBytes / 1024);
                // total = total + 'KB';
                total = Math.ceil(totalBytes / 1024) + 'KB';
            }
            else {
                total = (totalBytes / (1024 * 1024)).toFixed(1);
                total = total + 'MB';
            }

            // 
            this.checkForceUpdate(() => {
                //  WIFI 
                this.showUpdateDialog(total, () => {
                    this.hot.hotUpdate();
                })
            });
        };
        options.onNoNeedToUpdate = () => {
            this.lv.enter();
        };
        options.onUpdateFailed = () => {
            //this.lv.data.prompt = oops.language.getLangByID("update_tips_update_fail");
            this.hot.checkUpdate();
        };
        options.onUpdateSucceed = () => {
            //this.lv.data.progress = 100;
            //this.lv.data.prompt = oops.language.getLangByID("update_tips_update_success");

            setTimeout(() => {
                game.restart();
            }, 1000);
        };

        this.hot.init(options);
    }

    /**  */
    private checkForceUpdate(callback: Function) {
        let operate: any = {
            title: 'common_prompt_title_sys',
            content: "update_tips_force",
            okWord: 'common_prompt_ok',
            cancelWord: 'common_prompt_cancal',
            okFunc: () => {
                this.hot.clearHotUpdateStorage();
                callback();
            },
            cancelFunc: () => {
                game.end();
            },
            needCancel: true
        };
        oops.gui.open(UIID.Confirm, operate);
    }

    /**  WIFI  */
    private showUpdateDialog(size: string, callback: Function) {
        if (sys.getNetworkType() == sys.NetworkType.LAN) {
            callback();
            return;
        }
        tips.alert(oops.language.getLangByID("update_nowifi_tip") + size, callback);
    }
}