export const getHomeUrl = () => {
  const KNOWN_ROUTES = ["auth", "embedded", "portal"];
  const dirSep = "/";
  const pathArr = window.location.pathname.split("/");
  const lastVal = pathArr[pathArr.length - 1];

  if (KNOWN_ROUTES.includes(lastVal)) {
    pathArr.pop();
  }

  let homeUrl = pathArr.join("/") || "";
  if (!homeUrl.endsWith(dirSep)) homeUrl += dirSep;

  return homeUrl;
};

/**
 * Returns the PI structure with only POSTable fields
 * @param {Set} postableFields - set of fields that can be POSTed(i.e fields with visibilty:true)
 * @param {*} pi - PI structure
 * @returns {*} PI structure with only POSTable fields
 */
 export function getPostableFieldsPI(postableFields: Set<unknown>, pi: Record<string, any> | any){
  for(const pageInstruction of pi.pageInstructions){
      if(pageInstruction.instruction === "UPDATE"){
        for(const key in pageInstruction.content){
          if( !postableFields.has(key) ){
            delete pi.pageInstructions[pi.pageInstructions.indexOf(pageInstruction)].content[key];
          }
        }
      }
    }
  return pi;  
}
