import { ImageAsset, tween ,EventTouch, Vec3, director, Camera} from "cc";
import { Component } from "cc";
import { instantiate } from "cc";
import { Texture2D } from "cc";
import { SpriteFrame } from "cc";
import { Node } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { TrAudio } from "../../schema/schema";
import ConfigManager from "../../manager/Config/ConfigManager";
import { UIID } from "../../common/config/GameUIConfig";

export class Utility
{
    public static FormatBigNumber(number: number): string {
        const suffixes = ["", "", "", "", "", "", "", "Z", "Y"];
        let suffixIndex = 0;
        let decimalNumber = number;
    
        // 
        while (decimalNumber >= 10000 && suffixIndex < suffixes.length - 1) {
            decimalNumber /= 10000;
            suffixIndex++;
        }
    
        // 1
        let formattedNumber = decimalNumber.toFixed(1);
        if (Number.isInteger(decimalNumber)) {
            formattedNumber = decimalNumber.toFixed(0);
        }
    
        return formattedNumber + suffixes[suffixIndex];
    }
    public static GetYearMonthDay(): string {
        //  UTC 
        const timestamp = Math.floor(Date.now() / 1000);
        
        //  UTC 
        const date = new Date(timestamp * 1000); // JavaScript Date 
        
        //  UTC  0 
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // 
        const day = String(date.getUTCDate()).padStart(2, '0');        // 
        
        //  YYYYMMDD 
        return `${year}${month}${day}`;
    }

    public static async loadImage(urlPath: string,bundleName:string=oops.res.defaultBundleName):Promise<SpriteFrame|null> {

            let sp = await oops.res.loadAsync<SpriteFrame>(bundleName, urlPath + "/spriteFrame");
            return sp;
        /*let image = await oops.res.loadAsync<ImageAsset>(bundleName,urlPath);
        if (image) {
            const texture = new Texture2D();
            texture.image = image;

            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            return  spriteFrame;
        }
        return null;*/
    }
    
    public static initChild<T extends Component>(parent: Node, template: T, num: number, 
        onInitAction: (index: number, item: T) => void, list?: T[]): void {
        
        if (list) {
            list.length = 0;
        }
    
        const curNum = parent.children.length;
        const n = Math.max(num, curNum);
        const componentName = template.constructor.name;
    
        for (let i = 0; i < n; i++) {
            let item: T | null = null;
    
            if (i < curNum) {
            item = parent.children[i].getComponent(componentName) as T;
            } else {
                const newNode = instantiate(template.node);
                newNode.parent = parent;
                item = newNode.getComponent(componentName) as T;
            }
    
            if (!item) {
                continue;
            }
    
            item.node.active = i < num;
    
            if (i < num) {
                if (list) {
                    list.push(item);
                }
                
                if (onInitAction) {
                    onInitAction(i, item);
                }
            }
        }
    }
    
    /**
     * 
     * @param id id
     */
    public static PlayMusic(id: number, isFade : boolean = false){
        const cfg = ConfigManager.tables.TbAudio.get(id);
        if(cfg != null) {
            oops.audio.playMusic(cfg.Resource, undefined, "Audios", cfg.Loop, cfg.Volume);
            if(isFade){
                var oldVolume = oops.audio.music.volume;
                oops.audio.music.volume = 0;
                tween(oops.audio.music).to(1,{volume : oldVolume}).start();
            }
        }
    }

    public static PlayAmbMusic(id: number){
        if(id == 0) {
            return;
        }
        const cfg = ConfigManager.tables.TbAudio.get(id);
        if(cfg != null) {
            oops.audio.playAmbMusic(cfg.Resource, undefined, "Audios", cfg.Loop, cfg.Volume);
        }
    }

    public static StopAmbMusic() {
        oops.audio.stopAmbMusic();
    }

    public static StopMusic()
    {
        oops.audio.stopMusic();
    }

    public static PlayMusicWhenCloseUI(type:number)
    {
        oops.audio.stopMusic();
        if(type==1)
        {
            oops.audio.playMusic(Utility.GetMusicUrl(1001), undefined, "Audios");
        }
    }

    public static GetMusicUrl(type:number):string
    {
        let audio: TrAudio =ConfigManager.tables.TbAudio.get(type)!;
        return audio?.Resource;
    }

    // 
    public static PlayAudio(id:number): void {
        let audio: TrAudio = ConfigManager.tables.TbAudio.get(id)!;
        oops.audio.playEffect(audio?.Resource, "Audios");
    }

    /**
     * id
     * @param id 
     * @returns 
     */
    public static async PlayAudioOnId(id: number): Promise<number> {
        if(id <= 0) {
            return -1;
        }
        let audio: TrAudio = ConfigManager.tables.TbAudio.get(id)!;
        // console.log("PlayAudioOnId: res:", audio?.Resource ?? "");
        const eId = await oops.audio.playEffect(audio?.Resource, "Audios");

        return eId;
    }

    public static OpenItemTips(itemId : number, node : Node){
        if(itemId < 0 || node == null)
            return;

        if(oops.gui.has(UIID.UIItemTips)){
            oops.gui.remove(UIID.UIItemTips);
        }
        oops.gui.open(UIID.UIItemTips,{id:itemId, pos : node.worldPosition});
    }

    public static GetMouseLocalPosition(event: EventTouch,): Vec3 {
        const mousePos = event.touch?.getLocation()!;
        const outPos = new Vec3();

        // 
        oops.game.MainCamera.screenToWorld(
            new Vec3(mousePos.x, mousePos.y, 0),
            outPos
        );

        return outPos;
    }
}