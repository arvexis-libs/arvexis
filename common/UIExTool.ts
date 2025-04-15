import { Sprite, SpriteFrame, Texture2D } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { Label } from 'cc';
import ConfigManager from '../manager/Config/ConfigManager';
import { ImageAsset } from 'cc';
import { sp } from 'cc';

/**
 *  Sprite 
 * @param sprite  Sprite 
 * @param bundle 
 * @param path 
 */
export async function changeSpriteImage(sprite: Sprite, path: string, bundleName?: string): Promise<void> {
    if(path == "") {
        return;
    }

    if(sprite == null) {
        console.error("changeSpriteImage error sprite is null!!!");
        return;
    }
    if (bundleName === undefined) {
        bundleName = "";
    }
    sprite.node.active = false;
    let sp = await oops.res.loadAsync<SpriteFrame>(bundleName, path + "/spriteFrame");
    sprite.node.active = true;
    if(sp && sprite.isValid){
        sprite.spriteFrame = sp;
    }
    /*

    let imageAsset: ImageAsset;
    try {
        // SpriteFrame
        const originalSpriteFrame = sprite.spriteFrame;
        let insetLeft = originalSpriteFrame?.insetLeft ?? 0;
        let insetTop = originalSpriteFrame?.insetTop ?? 0;
        let insetRight = originalSpriteFrame?.insetRight ?? 0;
        let insetBottom = originalSpriteFrame?.insetBottom ?? 0;
        let isSliced = sprite.type === Sprite.Type.SLICED;

        // sprite.node.active = false;
        if (bundleName == "") {
            imageAsset = await oops.res.loadAsync<ImageAsset>(path, oops.res.defaultBundleName, ImageAsset);
        } else {
            imageAsset = await oops.res.loadAsync<ImageAsset>(bundleName, path, ImageAsset);
        }

        if (imageAsset) {
            //  SpriteFrame GameUIConfig.
            const texture2d = new Texture2D();
            texture2d.image = imageAsset;
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture2d;
            // 
            if (isSliced && (insetLeft > 0 || insetTop > 0 || insetRight > 0 || insetBottom > 0)) {
                spriteFrame.insetLeft = insetLeft;
                spriteFrame.insetTop = insetTop;
                spriteFrame.insetRight = insetRight;
                spriteFrame.insetBottom = insetBottom;
                // spriteFrame.capInsets = capInsets;
                sprite.type = Sprite.Type.SLICED;
            }
            //  Sprite  spriteFrame
            sprite.spriteFrame = spriteFrame;
            // sprite.sizeMode = Sprite.SizeMode.RAW;
            sprite.sizeMode = Sprite.SizeMode.CUSTOM; // 

        } else {
            console.error('imageAsset  undefined, path:%s, bundleName:%s', path, bundleName);
        }
        // sprite.node.active = true;
    } catch (error) {
        console.error('Failed to load image:', error);
        sprite.node.active = true;
    }*/
}

/**
 * 
 * @param key 
 * @returns 
 */
export function getImagePath(key: string): string {
    if(key == "") {
        return "";
    }
    var cfg = ConfigManager.tables.TbAtlas.get(key);
    if (cfg == null) {
        console.error("no find image key:", key);
        return "";
    }

    return cfg.Path;
}

export function getImageParam(key: string) : {path:string, bundle: string} {
    if(key == "") {
        return {path:"", bundle: ""};
    }
    var cfg = ConfigManager.tables.TbAtlas.get(key);
    if (cfg == null) {
        console.error("no find image key:", key);
        return {path:"", bundle: ""};
    }

    return {path:cfg.Path, bundle:cfg.BundleName};
}

/**
 * 
 * @param label 
 * @param key 
 * @returns 
 */
// export function changeLabelText(label: Label, key: string) {
//     if(label == null) {
//         console.error("changeLabel error Label is null!!!");
//         return
//     }
//     try {
        
//         var cfg = ConfigManager.tables.TbStrDictionary.get(key);

//         if(cfg == null){
//             console.error("no find key:",key);
//             return;
//         }
//         label.string = cfg?.Zh;

//         console.log('Label changed successfully!');
//     } catch (error) {
//         console.error('Failed to load Label:', error);
//     }
// }

/**
 * 
 * @param key 
 * @returns 
 */
// export function getLabelText(key: string) : string {
//     if(key == "") {
//         return "";
//     }
//     var cfg = ConfigManager.tables.TbStrDictionary.get(key);

//     if(cfg == null){
//         console.error("no find key:",key);
//         return "";
//     }
//     return cfg.Zh;
// }


export function getPhoneHeadIconPath(roleId: number) : string {
    switch (roleId) {
        case 1:
            return "Sprites/message_avatar_jw";
        case 2:
            return "Sprites/message_avatar_myw";
        case -1:
            return "Sprites/message_avatar_wanjia";
    
        default:
            return "Sprites/message_avatar_myw";
    }
}

/**
 * spine 
 * @param spineSkeleton 
 * @param path 
 * @param bundleName 
 * @param action 
 */
export async function changeSpine(spineSkeleton: sp.Skeleton, path: string, bundleName: string, action: string = "") {
    if(path == "") {
        return;
    }
    //spineSkeleton.node.active = false;
    try {
        const skeletonData = await oops.res.loadAsync<sp.SkeletonData>(bundleName, path, sp.SkeletonData);
        if(skeletonData == null) {
            //oops.gui.toast(`${bundleName},${path}, `);
            console.error(`${bundleName},${path}, `);
        }
        else{
            spineSkeleton.skeletonData = skeletonData;
            if(action !== "") {
                spineSkeleton.setAnimation(0, action, true);        
                spineSkeleton.timeScale = 1;
            }
        }
    }catch (error) {
        console.error('bundleName:%s,path:%s, ', bundleName, path, error);
        
    }
        
    //spineSkeleton.node.active = true;
}