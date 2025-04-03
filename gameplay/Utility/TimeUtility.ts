export class TimeUtility {
    private static StartTime: Date = new Date(1970, 0, 1); // 1970-01-01
    private static serverTime: string = "";
    private static ServerTimerInterval: number = 0;

    static set ServerTime(value: string) {
        TimeUtility.serverTime = value;
        TimeUtility.CalcInterval();
    }

    static get ServerTime(): string {
        return TimeUtility.serverTime;
    }

    private static CalcInterval(): void {
        if (!TimeUtility.serverTime) return;
        const serverTimeNum = parseInt(TimeUtility.serverTime);
        TimeUtility.ServerTimerInterval = serverTimeNum - Math.floor(Date.now() / 1000);
    }

    static ToTimeStamp(date: Date): number {
        return Math.floor(date.getTime() / 1000);
    }

    static ToDateTime(timeStamp: number): Date {
        return new Date(timeStamp * 1000);
    }

    static GetDateTime(): Date {
        const now = new Date();
        return new Date(now.getTime() + TimeUtility.ServerTimerInterval * 1000);
    }

    /**  */
    /**
     * 
     */
    static GetTimeStamp(): number {
        return Math.floor(Date.now() / 1000) + TimeUtility.ServerTimerInterval;
    }

    /**
     * 
     */
    static GetTimeStampMs(): number {
        return Date.now() + TimeUtility.ServerTimerInterval * 1000;
    }

    // region 
    static GetTimeFormat_MMSS(seconds: number, info: string = ":| "): string {
        const infoArr = info.split('|');
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}${infoArr[0]}${sec.toString().padStart(2, '0')}${infoArr[1]}`;
    }

    static GetTimeFormat_HHMMSS(seconds: number, info: string = ":|:| "): string {
        const infoArr = info.split('|');
        const hours = Math.floor(seconds / 3600);
        const min = Math.floor(seconds % 3600 / 60);
        const sec = seconds % 60;
        return `${hours.toString().padStart(2, '0')}${infoArr[0]}${min.toString().padStart(2, '0')}${infoArr[1]}${sec.toString().padStart(2, '0')}${infoArr[2]}`;
    }

    static GetTimeFormat_HHMM(seconds: number, info: string = ":|"): string {
        if (seconds < 60) return "00:00";
        const infoArr = info.split('|');
        const hours = Math.floor(seconds / 3600);
        const min = Math.floor(seconds % 3600 / 60);
        return `${hours.toString().padStart(2, '0')}${infoArr[0]}${min.toString().padStart(2, '0')}`;
    }

    static GetTimeFormat_DDHHMM(seconds: number, info: string = ":|:| "): string {
        const infoArr = info.split('|');
        const days = Math.floor(seconds / 86400);
        const remaining = seconds % 86400;
        const hours = Math.floor(remaining / 3600);
        const min = Math.floor(remaining % 3600 / 60);
        return `${days}${infoArr[0]}${hours.toString().padStart(2, '0')}${infoArr[1]}${min.toString().padStart(2, '0')}${infoArr[2]}`;
    }

    static GetTimeFormat_DD(seconds: number): string {
        return Math.ceil(seconds / 86400).toString();
    }

    static GetTimeDes(seconds: number): string {
        if (seconds > 86400) {
            const day = Math.ceil(seconds / 86400);
            //  
            return `${day}`;
        } else if (seconds >= 3600) {
            const hour = Math.ceil(seconds / 3600);
            return `${hour}`;
        } else if (seconds >= 60) {
            const min = Math.ceil(seconds / 60);
            return `${min}`;
        }
        return "1";
    }
    static GetPhoneLeftTimeDes(seconds: number): string {
        if (seconds > 86400) {
            const day = Math.ceil(seconds / 86400);
            //  
            return `${day}`;
        } else if (seconds >= 3600) {
            const hour = Math.ceil(seconds / 3600);
            return `${hour}`;
        } else if (seconds >= 60) {
            const min = Math.ceil(seconds / 60);
            return `${min}`;
        }
        return "1";
    }

    /**
     *  ":" 
     * @param timestamp 
     * @returns  "14:02"
     */
    static FormatTime(timestamp: number): string {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // endregion
}
