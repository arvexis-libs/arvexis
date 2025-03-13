import { oops } from "db://oops-framework/core/Oops";
import { SimpleHttp } from "../../../modules/base/SimpleHttp";
import * as pako from 'pako';
import { TextCodec } from "../../../modules/base/TextCodec";


interface ISaveAck{
    result:string,
    state:string,
    trace_id:string,
    data:ISaveDataAck
}

interface ISaveDataAck{
    data_key:string,
    message:string
}

interface IDownloadAck{
    result:string,
    state:string,
    trace_id:string,
    data:IDownloadDataAck
}
interface IDownloadDataAck{
    archive:string,
    client_version:string,
    data_hash:string,
    data_key:string,
    updated_at:number
}

interface ISaveReq{
    archive:string
}

export class CloudSaveHelper {
    private static _instance: CloudSaveHelper;
    public static get inst(): CloudSaveHelper {
        if (this._instance == null) {
            this._instance = new CloudSaveHelper();
        }
        return this._instance;
    }

    private uploadUrl:string = "https://archive.gyyx.cn/api/save-upload";
    private downloadUrl:string = "https://archive.gyyx.cn/api/latest-download";

    public async upload(data: string): Promise<void> {

        let token =  oops.storage.get("user_token")
        let headers: Record<string, string> = {
            "Authorization":"Bearer " + token,
        };
        
        let archi = this.zipData(data);
        console.log(""+ archi);
        console.log("token =- " + token);

        const sessionAck = await SimpleHttp.instance.postDataWithTimeout<ISaveAck>(this.uploadUrl, {
            archive : archi
        },headers)

        if(sessionAck?.result === "success"){
            console.log("");
        }
        else{
            console.log("" + sessionAck?.state);
        }
    }

    public async download(): Promise<string> {
        let token = oops.storage.get("user_token");
        console.log("token + " + token);
        let headers: Record<string, string> = {
            "Authorization":"Bearer " + token,
        };
        

        try {
            const cloudData = await SimpleHttp.instance.postDataWithTimeout<IDownloadAck>(this.downloadUrl, {

            }, headers);

            if(cloudData?.result === "success"){
                return this.unZipData(cloudData.data.archive);
            }
            else{
                return "";
            }
        } catch (error) {
        // 
        console.error(error);
        return "";
        }      
    }

    public zipData(jsonStr:string):string{

        //console.log("jsonStr = " + jsonStr);
        // 2. pakogzip
        const compressed = pako.gzip(jsonStr);
        const a = compressed.toString();

       // console.log("aaaaa = " + a);
        
        // 3. Uint8ArrayBase64Blob
        const baseStrData = this.uint8ArrayToHexString(compressed);
       // console.log("baseStrData = " + baseStrData);
        return baseStrData;
    }

    public unZipData(ack:string):string{

        const arrayBuffer = this.hexStringToUint8Array(ack);
        //console.log("unZipData = " + arrayBuffer);
        try {
            const decompressed = pako.ungzip(arrayBuffer);
            //console.log("decompressed = " + decompressed);
            const str = TextCodec.decode(decompressed);
            //console.log("strstrstrstr = " + str);
            return str;
        } catch (err) {
            console.log("" + err);
            return ""
        }

    }
    // ArrayBufferBase64
    private changeToStr(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        return TextCodec.decode(bytes);
    }
    
    // Base64ArrayBuffer
    private changeToBuffer(baseStr: string): ArrayBuffer {
        const bytes =  TextCodec.encode(baseStr);
        return bytes.buffer;
    }

/**
 *  Uint8Array 
 * @param uint8Array  Uint8Array
 * @returns 
 */
uint8ArrayToHexString(uint8Array: Uint8Array): string {
    return Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   *  Uint8Array
   * @param hexString 
   * @returns  Uint8Array
   */
  hexStringToUint8Array(hexString: string): Uint8Array {
    // 
    if (hexString.length % 2 !== 0) {
      throw new Error('Hex string must have an even length');
    }
  
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      const byteStr = hexString.substr(i, 2);
      const byte = parseInt(byteStr, 16);
      
      // 
      if (isNaN(byte)) {
        throw new Error(`Invalid hex byte: ${byteStr}`);
      }
      
      bytes[i / 2] = byte;
    }
    return bytes;
  }
      

}