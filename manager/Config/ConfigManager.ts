import { _decorator, resources, BufferAsset, Component } from 'cc';
import * as cfg from '../../schema/schema';
import { oops } from 'db://oops-framework/core/Oops';
import ByteBuf from '../../bright/serialization/ByteBuf';

const { ccclass, property } = _decorator;
@ccclass('ConfigManager')
export default class ConfigManager{
    public static tables:cfg.Tables;
    private static dataMap = new Map<string, Uint8Array>();
    public static jsonFileNames:string[] = [];

    private static loadConfigName(): void
    {
        ConfigManager.jsonFileNames = cfg.Tables.getTableNames()
    }

    public static async loadAllConfig()
    {
        this.loadConfigName();
        let promises:Promise<unknown>[] = [];
        for(let curFileName of ConfigManager.jsonFileNames)
        {
            let promise=new Promise((resolve, reject) => {
                oops.res.load("configs/"+curFileName, BufferAsset, (err: Error | null, data: BufferAsset) => {
                    resolve(data);
                });
            });
            promise.then((data) => 
            {
                if (data) {
                    ConfigManager.dataMap.set(curFileName, new Uint8Array((data as BufferAsset).buffer().slice(0, (data as BufferAsset).buffer().byteLength)));
                } else {
                    console.error("" + curFileName);
                }
            });
            promises.push(promise);
        }
        return Promise.all(promises).then((values)=>
        {
            console.log("");
            ConfigManager.tables = new cfg.Tables(this.getFileData);
            console.log("ConfigManager.tables " + ConfigManager.tables);
        });
    }
    private static getFileData(fileName: string): ByteBuf {
        const data = ConfigManager.dataMap.get(fileName);
        if (data === undefined) {
            throw new Error(`Config file ${fileName} not found or data is empty`);
        }
        return new ByteBuf(data);
    }
}