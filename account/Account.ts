/*
 * @Author: dgflash
 * @Date: 2021-11-11 17:45:23
 * @LastEditors: dgflash
 * @LastEditTime: 2022-08-01 13:49:37
 */

import { HttpReturn } from "db://oops-framework/libs/network/HttpRequest";
import { oops } from "../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { ecs } from "../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { GameEvent } from "../common/config/GameEvent";
//import { AccountNetDataComp, AccountNetDataSystem } from "./bll/AccountNetData";
import { AccountModelComp } from "./model/AccountModelComp";
import { SdkManager } from "../../modules/sdk/SdkManager";
import { ESdkCode, ILoginResult } from "../../modules/sdk/ISdk";
import { tips } from "../common/prompt/TipsManager";
import { GameData } from "../gameplay/GameDataModel/GameData";

/**
 * 
 * 1
 * 2
 * 3
 */
@ecs.register('Account')
export class Account extends ecs.Entity {
    AccountModel!: AccountModelComp;
    //AccountNetData!: AccountNetDataComp;

    protected init() {
        this.addComponents<ecs.Comp>(AccountModelComp);
        this.addEvent();
    }

    destroy(): void {
        this.removeEvent();
        super.destroy();
    }

    /**  */
    private addEvent() {
        oops.message.on(GameEvent.GameServerConnected, this.onHandler, this);
    }

    /**  */
    private removeEvent() {
        oops.message.off(GameEvent.GameServerConnected, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case GameEvent.GameServerConnected:
                this.getPlayer();
                break;
        }
    }

    /**  */
    connect() {
        // netChannel.gameCreate();
        // netChannel.gameConnect();
        // let url = "https://huaguangshigeyi.wyx.cn/api/wx/login";
        // let game_id = "571137337";
        // var param = '{"code":"donggang_dev","game_id":"571137337"}';
        // let ret= oops.http.postAsync(url, param);
        // if((await ret).isSucc)
        // {
        //     console.log("111111111");
        // }
        // 
        console.log("");
        SdkManager.inst.login((result:ILoginResult) => {
            if(result.code == ESdkCode.Sdk_LoginSucess){
                GameData.openid = result.token;
                console.log("="+GameData.openid);
                oops.message.dispatchEvent(GameEvent.LoginSuccess);
            }
            else{
                console.log("" + result.err);
                oops.message.dispatchEvent(GameEvent.LoginFailed);
            }
         });
    }

    /**  */
    getPlayer() {
        //this.add(AccountNetDataComp);
    }
}

// export class EcsAccountSystem extends ecs.System {
//     constructor() {
//         super();

//         this.add(new AccountNetDataSystem());
//     }
// }
