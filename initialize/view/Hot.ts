import { error, log, native, sys } from "cc";
import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";

/**  */
export class HotOptions {
    /**  */
    onVersionInfo: Function | null = null;
    /**  */
    onNeedToUpdate: Function | null = null;
    /**  */
    onNoNeedToUpdate: Function | null = null;
    /**  */
    onUpdateFailed: Function | null = null;
    /**  */
    onUpdateSucceed: Function | null = null;
    /**  */
    onUpdateProgress: Function | null = null;

    check() {
        for (let key in this) {
            if (key !== 'check') {
                if (!this[key]) {
                    log(`HotOptions.${key}`);
                    return false;
                }
            }
        }
        return true
    }
}

/**  */
export class Hot {
    private assetsMgr: native.AssetsManager = null!;
    private options: HotOptions | null = null;
    private state = Hot.State.None;
    private storagePath: string = "";
    private manifest: string = "";

    static State = {
        None: 0,
        Check: 1,
        Update: 2,
    }

    /**  */
    init(opt: HotOptions) {
        if (!sys.isNative) {
            return;
        }
        if (!opt.check()) {
            return;
        }
        this.options = opt;

        if (this.assetsMgr) {
            return;
        }

        oops.res.load('project', (err: Error | null, res: any) => {
            if (err) {
                error("");
                return;
            }

            this.showSearchPath();

            this.manifest = res.nativeUrl;
            this.storagePath = `${native.fileUtils.getWritablePath()}oops_framework_remote`;
            this.assetsMgr = new native.AssetsManager(this.manifest, this.storagePath, (versionA, versionB) => {
                console.log(": " + versionA + ', : ' + versionB);
                this.options?.onVersionInfo && this.options.onVersionInfo({ local: versionA, server: versionB });

                let vA = versionA.split('.');
                let vB = versionB.split('.');
                for (let i = 0; i < vA.length; ++i) {
                    let a = parseInt(vA[i]);
                    let b = parseInt(vB[i] || '0');
                    if (a !== b) {
                        return a - b;
                    }
                }

                if (vB.length > vA.length) {
                    return -1;
                }
                else {
                    return 0;
                }
            });

            // truefalse
            this.assetsMgr.setVerifyCallback((path: string, asset: jsb.ManifestAsset) => {
                // md5zip
                var compressed = asset.compressed;
                // md5
                var expectedMD5 = asset.md5;
                // 
                var relativePath = asset.path;
                // 
                var size = asset.size;

                return true;
            });

            var localManifest = this.assetsMgr.getLocalManifest();
            console.log(': ' + this.storagePath);
            console.log(': ' + this.manifest);
            console.log(': ' + localManifest.getPackageUrl());
            console.log(' project.manifest : ' + localManifest.getManifestFileUrl());
            console.log(' version.manifest : ' + localManifest.getVersionFileUrl());

            this.checkUpdate();
        });
    }

    /**  */
    clearHotUpdateStorage() {
        native.fileUtils.removeDirectory(this.storagePath);
    }

    // 
    checkUpdate() {
        if (!this.assetsMgr) {
            console.log('')
            return;
        }

        if (this.assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
            error('')
            return;
        }
        if (!this.assetsMgr.getLocalManifest().isLoaded()) {
            console.log(' manifest  ...');
            return;
        }
        this.assetsMgr.setEventCallback(this.onHotUpdateCallBack.bind(this));
        this.state = Hot.State.Check;
        // version.manifest
        this.assetsMgr.checkUpdate();
    }

    /**  */
    hotUpdate() {
        if (!this.assetsMgr) {
            console.log('')
            return
        }
        this.assetsMgr.setEventCallback(this.onHotUpdateCallBack.bind(this));
        this.state = Hot.State.Update;
        this.assetsMgr.update();
    }

    private onHotUpdateCallBack(event: native.EventAssetsManager) {
        let code = event.getEventCode();
        switch (code) {
            case native.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log("");
                this.options?.onNoNeedToUpdate && this.options.onNoNeedToUpdate(code)
                break;
            case native.EventAssetsManager.NEW_VERSION_FOUND:
                console.log(',');
                this.options?.onNeedToUpdate && this.options.onNeedToUpdate(code, this.assetsMgr!.getTotalBytes());
                break;
            case native.EventAssetsManager.ASSET_UPDATED:
                console.log('');
                break;
            case native.EventAssetsManager.UPDATE_PROGRESSION:
                if (this.state === Hot.State.Update) {
                    // event.getPercent();
                    // event.getPercentByFile();
                    // event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                    // event.getDownloadedBytes() + ' / ' + event.getTotalBytes();
                    console.log('...', event.getDownloadedFiles(), event.getTotalFiles(), event.getPercent());
                    this.options?.onUpdateProgress && this.options.onUpdateProgress(event);
                }
                break;
            case native.EventAssetsManager.UPDATE_FINISHED:
                this.onUpdateFinished();
                break;
            default:
                this.onUpdateFailed(code);
                break;
        }
    }

    private onUpdateFailed(code: any) {
        this.assetsMgr.setEventCallback(null!)
        this.options?.onUpdateFailed && this.options.onUpdateFailed(code);
    }

    private onUpdateFinished() {
        this.assetsMgr.setEventCallback(null!);
        let searchPaths = native.fileUtils.getSearchPaths();
        let newPaths = this.assetsMgr.getLocalManifest().getSearchPaths();
        Array.prototype.unshift.apply(searchPaths, newPaths);
        localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
        native.fileUtils.setSearchPaths(searchPaths);

        console.log('');
        this.options?.onUpdateSucceed && this.options.onUpdateSucceed();
    }

    private showSearchPath() {
        console.log("================================================");
        let searchPaths = native.fileUtils.getSearchPaths();
        for (let i = 0; i < searchPaths.length; i++) {
            console.log("[" + i + "]: " + searchPaths[i]);
        }
        console.log("======================================================");
    }
}