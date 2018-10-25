import {Injectable} from "@angular/core";

@Injectable()
export class Utils {
    constructor() { }

    /**
     * Generate a new random GUID.
     * 
     * @param noHyphen set to TRUE to remove hyphen in GUID string
     */
    public newGuid(noHyphen: boolean): string {
        let format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

        if (noHyphen) {
            format = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx';
        }

        return format.replace(/[xy]/g, function(c) {
            let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            
            return v.toString(16);
        });
    }

    /**
     * Check for string Null and Whitespace.
     * 
     * @param input 
     */
    public isStringValid(input: string): boolean {
        if (input == null) { // double equal to check for both null and undefined
            return false;
        }

        return (input.replace(/\s/g, "").length > 0 ? true : false);
    }

    /**
     * Return the Date.Now as unixtime.
     */
    public dateNowUnixTime(): number {
        return Math.round(Date.now() / 1000);
    }

    /**
     * Return the unixtime from the date string.
     * 
     * @param dateStr Must be a valid typescript Date string format.
     */
    public dateStringUnixTime(dateStr: string): number {
        let date = new Date(dateStr);

        return Math.round(date.getTime() / 1000);
    }

    /**
     * Returns the type Date ISO String from a unix time.
     * 
     * @param unixtime
     */
    public unixTimeToDateIso(unixtime: number): string {
        // Convert the unix time we had to the compatible typescript elapse seconds
        const compatibleunixtime: number = unixtime * 1000; 

        return new Date(compatibleunixtime).toISOString();

        // console.log('unixtime: ' + unixtime);
        // let date = new Date();

        // date.setTime(compatibleunixtime);
        // console.log('unixTimeToDateIso: ' + date.toISOString());
        // return date.toISOString();
    }
}