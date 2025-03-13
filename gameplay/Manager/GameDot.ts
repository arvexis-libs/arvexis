import { sys } from "cc";
import { GameData } from "../GameDataModel/GameData";
import { native } from "cc";
import { oops } from "db://oops-framework/core/Oops";

export enum ADEnum {
    None = 0,
    Freecash_adv,   // 
    Autclick_adv,   // 
    Reload_adv,     // 
    Fitness_adv,    // 
    Photo_adv,      // 
    Carport_adv,    // 
    Clerk_adv,      // 
    Earn_adv,       // 
    Shop_adv,       // 
    Gril_adv,       // 
    Money_adv,      // 
    Invest_adv,     // 
    PlayerInfo_adv, // 
    Offline_adv,    // 
    QuQianUp_adv,   // 
    Lvup_adv = 16,  // 
    Online_adv = 17, // 
    RedStar_adv = 18, // 
    QuQianCircleLvUp = 19,  //
}

export class GameDot {

    private static _instance: GameDot;
    public static get Instance(): GameDot {
        if (!this._instance) {
            this._instance = new GameDot();
        }
        return this._instance;
    }

    public url: string = "https://lingge-pt.gyyx.cn";
    // public z_url: string = "https://7458-114-242-25-126.ngrok-free.app/api/dot/batch?game_id=";
    // public readonly game_id: string = "54080955";
    public z_url: string = "https://lingge-pt.gyyx.cn/api/dot/batch?game_id=";
    public readonly game_id: string = "123271680";
    private readonly region_id: string = "";
    public platform: string = "APP";

    private online_time: number = 0;
    public Init() {

    }

    public SetTime() {
        this.online_time++;
        if (this.online_time >= 60) {
            this.OnlineDot();
            this.online_time = 0;
        }
    }

    /**
     * 
     */
    public RegisterDot(): void {
        const pData = {
            game_id: this.game_id,
            account_id: GameData.openid,
            device_id: GameData.openid,
            device_os: "",
            region_id: this.region_id,
            mac: "",
            oaid: "",
            idfa: "",
            androidid: "",
            ip: "",
            platform: this.get_device_os(),
            channel: this.get_channel(),
            ts: this.get_ts()
        };
        this.sendDot(`${this.url}/api/dot/register`, JSON.stringify(pData));
    }

    /**
     * 
     */
    public RoleDot(): void {
        const pData = {
            game_id: this.game_id,
            platform: this.get_device_os(),
            channel: this.get_channel(),
            mac: this.get_mac(),
            oaid: this.get_oaid(),
            idfa: this.get_idfa(),
            androidid: this.get_androidid(),
            account_id: this.get_device_id(),
            device_id: this.get_device_id(),
            device_os: this.get_device_os(),
            region_id: this.region_id,
            server_id: this.get_channel(),
            server_name: this.get_channel(),
            curr_server_id: "",
            curr_area_server_name: "",
            role_id: GameData.openid, //useridrole_id
            role_name: "",
            role_gender: "",
            role_job: "",
            ip: "",
            ts: this.get_ts()
        };
        this.sendDot(`${this.url}/api/dot/role`, JSON.stringify(pData));
    }

    /**
     * 
     */
    public LoginDot(): void {
        const pData = {
            game_id: this.game_id,
            account_id: this.get_device_id(),
            device_id: this.get_device_id(),
            device_os: this.get_device_os(),
            role_id: GameData.openid,
            region_id: this.region_id,
            server_id: this.get_channel(),
            ip: "",
            platform: this.get_device_os(),
            channel: this.get_channel(),
            ts: this.get_ts()
        };
        this.sendDot(`${this.url}/api/dot/login`, JSON.stringify(pData));

    }

    /**
     * 
     * @param guideId 
     */
    public GuideDot(guideId: number): void {
        if (GameData.openid == "") {
            return;
        }
        const pData = {
            account_id: this.get_idfa(),
            role_id: GameData.openid,
            device_id: "",
            device_os: "",
            guide_id: guideId,
            region_id: this.region_id,
            client_version: "",
            api: "custom",
            table_name: "log_guide",
            ts: this.get_ts()
        };
        const pDataArray = [pData];
        this.sendDot(`${this.z_url}${this.game_id}`, JSON.stringify(pDataArray));
    }

    /**
     * 
     * 1
     */
    private OnlineDot(): void {
        if (GameData.openid == "") {
            return;
        }
        const pData = {
            account_id: this.get_idfa(),
            role_id: GameData.openid,
            device_id: "",
            device_os: "",
            region_id: this.region_id,
            client_version: "",
            /** */
            ol_time: 1,
            api: "custom",
            table_name: "log_online",
            ts: this.get_ts()
        };
        const pDataArray = [pData];
        this.sendDot(`${this.z_url}${this.game_id}`, JSON.stringify(pDataArray));
    }

    public LevelDot(roleid: number, level: number): void {
        if (GameData.openid == "") {
            return;
        }
        const pData = {
            account_id: this.get_idfa(),
            role_id: GameData.openid,
            device_id: "",
            device_os: "",
            region_id: this.region_id,
            client_version: "",
            /** */
            userid: roleid,
            sense_level: level,
            api: "custom",
            table_name: "log_level",
            ts: this.get_ts()
        };
        const pDataArray = [pData];
        this.sendDot(`${this.z_url}${this.game_id}`, JSON.stringify(pDataArray));
    }

    /**
     * 
     * @param videoid 
     * @param status 
     */
    public VideoStatusDot(videoid: number, status: number): void {
        const pData = {
            account_id: this.get_idfa(),
            role_id: GameData.openid,
            device_id: "",
            device_os: "",
            region_id: this.region_id,
            client_version: "",
            video_id: videoid,
            video_status: status,
            api: "custom",
            table_name: "log_video_status",
            ts: this.get_ts()
        };
        const pDataArray = [pData];
        this.sendDot(`${this.z_url}${this.game_id}`, JSON.stringify(pDataArray));
    }

        /**
     * 
     * @param videoid 
     * @param status 
     */
    public DialogTalkDot(id: number, state: number): void {
        const pData = {
            account_id: this.get_idfa(),
            role_id: GameData.openid,
            device_id: "",
            device_os: "",
            region_id: this.region_id,
            client_version: "",
            talk_id: id,
            talk_state: state,
            api: "custom",
            table_name: "log_talk",
            ts: this.get_ts()
        };
        const pDataArray = [pData];
        this.sendDot(`${this.z_url}${this.game_id}`, JSON.stringify(pDataArray));
    }

        /**
     * 
     * @param videoid 
     * @param status 
     */
    public StoryLookDot(id: number, state: number): void {
        const pData = {
            account_id: this.get_idfa(),
            role_id: GameData.openid,
            device_id: "",
            device_os: "",
            region_id: this.region_id,
            client_version: "",
            story_id: id,
            story_state: state,
            api: "custom",
            table_name: "log_story",
            ts: this.get_ts()
        };
        const pDataArray = [pData];
        this.sendDot(`${this.z_url}${this.game_id}`, JSON.stringify(pDataArray));
    }

    public Dot(data: any) {
        const pDataArray = [this.get_defdata(data)];
        console.log(JSON.stringify(pDataArray));
        this.sendDot(`${this.z_url}${this.game_id}`, JSON.stringify(pDataArray));
    }

    private get_defdata(data: any): any {
        const pData = {
            account_id: this.get_idfa(),
            role_id: GameData.openid,
            device_id: "",
            device_os: "",
            region_id: this.region_id,
            client_version: "",
            api: "custom",
            table_name: "log_role",
            ts: this.get_ts(),
            userid: 0,
            sense_level: 0,
            sense_get_map: 0,
            sense_get_map_where: 0,
            mapstorytimes: 0,
            mapstory_end_times: 0,
            musicgame_times: 0,
            musicgame_end_times: 0,
            token_change: 0,
            token_change_value: 0,
            message_get: 0,
            message_view: 0,
            inter_click: 0,
            inter_click_value: 0,
            constellation_in: 0,
            constellation_use: 0,
            constellation_time: 0,
            mapstory_time: 0,
            musicgame_time: 0
        };
        return Object.assign({}, pData, data);
    }

    private sendDot(url: string, jsonData: string): void {
        if (sys.os == sys.OS.ANDROID && sys.isNative) {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onerror = () => {
                console.log("dot error: " + xhr.statusText);
            };

            xhr.send(jsonData);
        }
    }

    // Helper methods - you'll need to implement these based on your game's requirements
    private get_channel(): string {
        // Implement your channel logic
        return "weixin";
    }

    private get_ts(): number {
        // Return timestamp
        return Math.floor(Date.now() / 1000);
    }

    private get_mac(): string {
        // Implement MAC address retrieval
        return "";
    }

    private get_oaid(): string {
        // Implement OAID retrieval
        return "";
    }

    private get_idfa(): string {
        // Implement IDFA retrieval
        return "";
    }

    private get_androidid(): string {
        // Implement Android ID retrieval
        return "";
    }

    private get_device_id(): string {
        if (sys.os == sys.OS.ANDROID && sys.isNative) {
            // const pseudoId = native.reflection.callStaticMethod("com/cocos/gysdk/GYSDKManager", "GetPseudoID", "()Ljava/lang/String");
            // // AndroidJava
            // if (typeof pseudoId === "string") {
            //     console.log("PseudoID:", pseudoId);
            // } else if (pseudoId?.toString) {
            //     // JavatoString()
            //     console.log("PseudoID:", pseudoId.toString());
            // } else {
            //     console.error("", pseudoId);
            // }

            // return pseudoId;
            const value =  oops.storage.get("device_id");
            return value;
        }
        return "";
    }

    private get_device_os(): string {
        // Implement device OS retrieval
        const platform = sys.platform;

        // Android
        if (platform === sys.Platform.ANDROID) {
            return "android";
        }
        // iOS
        else if (platform === sys.Platform.IOS) {
            return "ios";
        }
        // 
        else {
            return platform.toString(); // 
        }
    }


    private async get_ip(): Promise<string> {
        // Implement IP retrieval
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip || '';
        } catch (e) {
            // error('Failed to get IP:', e);
            return '';
        }
    }
}