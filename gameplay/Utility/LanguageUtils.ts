import ConfigManager from "../../manager/Config/ConfigManager";

const LanguageUtils = {
    /**
     * 
     * @param key 
     * @param args 
     */
    GetLanguageString: function (key: string, ...args: any[]): string {
        const text = this.GetLocalText(key);
        return this.formatString(text, ...args);
    },

    /**
     * 
     * @param key 
     * @param isError 
     */
    GetLocalText: function (key: string, isError = true): string {
        const trDic = ConfigManager.tables.TbStrDictionary.get(key);
        if (!trDic) {
            if (isError) {
                console.warn(`: ${key}`);
            }
            return key;
        }
        let text = trDic.Zh;
        text = text.replace(/\\n/g, '\n'); // 
        return text;
    },

    /**
     * 
     * @param key 
     */
    GetKeyIsInDic: function (key: string): string {
        if (!key) {
            console.error(`: ${key}`);
            return "";
        }
        return this.GetLocalText(key, false);
    },

    /**
     *  {0}, {1} 
     * @param text 
     * @param args 
     */
    formatString: function (text: string, ...args: any[]): string {
        return text.replace(/{(\d+)}/g, (match, index) => {
            const argIndex = parseInt(index);
            return args[argIndex] !== undefined ? args[argIndex].toString() : match;
        });
    }
};

// 
export default LanguageUtils;