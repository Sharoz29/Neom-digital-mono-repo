/* Helper function to return the proper class for "iconSource" property values of
 *  "styleClass" and "standardIcon"
 */
import {
  iconSources,
  standardIcons
} from "../_constants";

export const getImageInfo = ( imageSource, imageStyle, imageStandard, image ) => {
  // imageSource will contain either "styleClass", "standardIcon", "image" or 
  // imageStyle is used when imageSource is "styleClass" and will contain the CSS class
  //   typically "pi pi-<name>"
  // imageStandard is used when imageSource is "standardIcon" and will contain the CSS class
  //    values with "icon-<name>"
  // image is used when imageSource is "image" and would be the trail portion of the full pega
  //    image url

  let retClass = "", sIconName = "", retImage = null, bLocalImgPresent=false;
  
  switch( imageSource ) {
    case iconSources.STYLECLASS:
      sIconName = imageStyle.replace(/^pi pi-/g, "");
      switch(sIconName) {
        case "":
          // remap to app specific icon or leverage pega image assets
          break;
        default:
          retClass = imageStyle;
          break;
      }
      break;
    case iconSources.STANDARD:
      // imageStandard will contain the icon name (typically "pxIcon<name>")

      // First allow the app specific Semantic icon mappings done in FormConstants.js (need icon class appended as well)
      retClass = standardIcons[imageStandard];
      if( retClass ) {
        retClass += " icon";
      } else {
        sIconName = imageStandard.replace(/^pxI/g, "i");
        switch(imageStandard) {
          // remap to app specific icon basd on this or leverage pega image assets
          case "pxIcon": //blank
            retClass = "pi iconBlank";
            break;
          default:
            retClass = "pi " + sIconName;
            break;
        }
      }
      break;
    case iconSources.IMAGE:
      // linkImage refers to the image relative path to <pega server>/prweb/<accessgrouphash>/
      // Will not be possible to directly load it (so see if a copy has been moved to loacal app assets)
      if (image && image !="") {
        bLocalImgPresent = true;
        try {
          retImage = require(`../assets/img/${image}`);
        } catch (e) {
          bLocalImgPresent = false;
          retImage = null;
        }
      }
      if( !bLocalImgPresent ) {
        // return best image for not supported
        retClass = "pi pi-cancel";
      }
      break;
    case iconSources.PROPERTY:
    case iconSources.EXTERNAL_URL:
        // Needs to be handled by caller
    case "none":
      break
    default:
      // return best image for not supported
      retClass = "pi pi-cancel"
      break;
  }
  return {class: retClass, src: retImage};
}

