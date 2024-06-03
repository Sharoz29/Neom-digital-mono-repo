/**
 * Check if the value is either string 'true' or boolean true
 * @param {Boolean or String} propVal 
 */
export function isTrue(propVal) {
  return propVal === "true" || propVal === true;
}

/*
 * Convert a JS Date to a Pega expected Date value
 * @param {Date} date
 * @param {String} fmtDateTime (one of "date", "time", "auto" or "dateTime"). 
 *   getDatePickerFmtDetails should have been previously called to eliminate auto.
 */
export function dateToPegaDateValue( date, fmtDateTime ) {
  let padZeros = (n, len) => {
    let retVal = '' + n;
    let nPad = len - retVal.length;
    if( nPad > 0 ) {
      retVal = "0".repeat(nPad) + retVal;
    }
    return retVal;  
  };
  let sValue = '';

  switch(fmtDateTime){

    case "date": 
      sValue += '' + padZeros(date.getFullYear(),4) + padZeros(date.getMonth()+1,2) +
      padZeros(date.getDate(),2);
      break;

    case "time": 
      sValue += 'T' + padZeros(date.getUTCHours(),2) + padZeros(date.getUTCMinutes(),2) +
      padZeros(date.getUTCSeconds(),2) + ".000 GMT";
      break;

    case "dateTime": 
      sValue += '' + padZeros(date.getUTCFullYear(),4) + padZeros(date.getUTCMonth()+1,2) +
      padZeros(date.getUTCDate(),2);
      
      sValue += 'T' + padZeros(date.getUTCHours(),2) + padZeros(date.getUTCMinutes(),2) +
      padZeros(date.getUTCSeconds(),2) + ".000 GMT";

      break;

    default:
      break;  
 }
 return sValue;
}
