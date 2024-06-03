/**
 * Remove HTML encoded characters from text string (and optionally
 *  strip outer quotes)
 * @param { String } sVal - HTML value to be decoded
 * @return { String } HTML decoded string
 */
export const htmlDecode = (sVal, bStripOuterQuotes=false) => {
    if( sVal && sVal.length > 0 ) {
        if( -1 != sVal.indexOf("&") ) {
            const doc = new DOMParser().parseFromString(sVal, "text/html");
            sVal = doc.documentElement.textContent;
        }
        if( bStripOuterQuotes && sVal.charAt(0) === '"') {
            sVal = sVal.replace(/"$/, "").replace(/^"/, "");
        }
    }
    return sVal;
}


