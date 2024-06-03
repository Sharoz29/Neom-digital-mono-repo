

/** 
 * Helper function to take mode.dataPageParams and convert it to the structure expected to pass params on the GET /data/{ID} endpoint
 * @param {Object} - Structure received in control.modes[?].dataPageParams
 * @returns {Object} - Structure to be passed to DataService.get
 */
export const buildDPParams = (dpParams) => {
    let pPage = {};

    if (dpParams && dpParams.length > 0) {

        for (let i in dpParams) {
            let sVal = "";
            if (dpParams[i].value != null) {
                sVal = dpParams[i].value;
            }
            else {
                sVal = dpParams[i].valueReference.lastSavedValue;
            }

            pPage[dpParams[i].name] = sVal;
        }
    }
    return pPage;
}

/** 
 * Helper function to take output from buildDPParams (structure to pass to DataService.get and come up with a unique string
 *  representation of the query to compare against any adjusted string based on a different mode.dataPageParams passed in
 * @param {Object} - Structure received in control.modes[?].dataPageParams
 * @returns {Object} - Structure to be passed to DataService.get
 */
export const buildDPQueryString = (dpID, params) => {
    let sortable = [];
    for( let name in params ) {
        sortable.push( [name, params[name]] );
    }
    sortable.sort((a,b) => {return a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0)});
    let query = "";
    if( sortable.length > 0 ) {
        sortable.map(entry => {
            if( query != "" ) {
                query += "&"
            }
            query += entry[0] + "=" + entry[1];
        });  
    }
    return dpID + "?" + query;
}
