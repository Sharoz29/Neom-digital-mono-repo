// Class used to construct the "pageInstructions" property within DX API transactions
import { ReferenceHelper } from "./ReferenceHelper";
import { refTypes } from "../_constants";
  
class PageInstructions {

    /**
     * Initialize and return a pageInstructions object.
     * @param {Object} oPostSettings - structure containing bUseEmbedPI, bUseRepeatPI, bOnlyModifiedContent(Future)
     * @return {Object} oPI 
     */
    constructor(oPostSettings = {}) {
        // post settings are placed inside the same structure as this oPI structure is passed to various actions routines which
        //  update data via getPostSettings
        this.oPI = {pageInstructions: [], postSettings: oPostSettings};
    }

    clearPageInstructions() {
        this.oPI.pageInstructions = [];
    }

    // Returns the outer structure so settings are included
    getPageInstructions() {
        return this.oPI;
    }

    getPostSettings() {
        return this.oPI.postSettings;
    }

    clonePageInstructions() {
        let ret = new PageInstructions(this.getPostSettings());
        // Doing a shallow copy..that should be sufficient
        ret.oPI.pageInstructions = this.oPI.pageInstructions.slice(0);
        return ret;
    }

    /**
     * Add a listIndex instruction
     * 
     * @param {String} instruction 
     * @param {String} target 
     * @param {Number} listIndex 
     * @param {Object} content 
     */
    addAListInstruction( instruction, target, listIndex, content ) {
        let oInstruction = new Object();
        instruction = instruction.toUpperCase();

        oInstruction["instruction"] = instruction;
        if (target.indexOf(".") != 0) {
            target = "." + target;
        }
        oInstruction["target"] = target;
        if (instruction != "APPEND") {
            if (listIndex != null && listIndex > 0) {
                oInstruction["listIndex"] = listIndex;
            }
        }
        oInstruction["content"] = content;

        let arPI = this.oPI["pageInstructions"];

        arPI.push(oInstruction);

        this.oPI["pageInstructions"] = arPI;
    }

    /**
     * Obtain the current last instruction
     * 
     * @returns {Object}
     */
    getLastInstruction() {
        let oReturn = null;
        let arPI = this.oPI["pageInstructions"];
        if (arPI.length > 0) {
            oReturn = arPI[arPI.length-1];
        }

        return oReturn;
    }

    /**
     * Is this the last list instruction
     * @param {String} instruction 
     * @param {String} target 
     * @param {Number} listIndex 
     * @returns {Boolean}
     */
    isLastListInstruction(instruction, target, listIndex) {
        let bReturn = false;

        if (target.indexOf(".") != 0) {
            target = "." + target;
        }

        let oLastInst = this.getLastInstruction();
        if (oLastInst != null) {
            if ((oLastInst["instruction"] === instruction) && 
                (oLastInst["target"] === target) &&
                (oLastInst["listIndex"] == listIndex)) {
                    bReturn = true;
            }
        }
    
        return bReturn;
    }

    /**
     * Get content for last instruction
     * @returns {Object}
     */
    getLastInstructionContent() {
        let oReturn = null;
        let oLast = this.getLastInstruction();
        if (oLast != null) {
            oReturn = oLast["content"];
        }

        return oReturn;
    }

    /**
     * Update content for last instruction
     * @param {Object} content 
     */
    updateLastInstructionContent(content) {
        let oLast = this.getLastInstruction();
        oLast["content"] = content;
    }

    /**
     * Add a Group Instruction
     * @param {String} instruction 
     * @param {String} target 
     * @param {String} groupIndex 
     * @param {Object} content 
     */
    addAGroupInstruction( instruction, target, groupIndex, content ) {
        let oInstruction = new Object();
        instruction = instruction.toUpperCase();

        oInstruction["instruction"] = instruction;
        if (target.indexOf(".") != 0) {
            target = "." + target;
        }
        oInstruction["target"] = target;

        if (instruction != "APPEND") {
            if (groupIndex != null && groupIndex != "") {
                oInstruction["groupIndex"] = groupIndex;
            }
        }
        oInstruction["content"] = content;

        let arPI = this.oPI["pageInstructions"];

        arPI.push(oInstruction);

        this.oPI["pageInstructions"] = arPI;
    }

    /**
     * Is this the last Group Instruction?
     * @param {String} instruction 
     * @param {String} target 
     * @param {String} groupIndex 
     * @returns {Boolean}
     */
    isLastGroupInstruction( instruction, target, groupIndex ) {
        let bReturn = false;

        if (target.indexOf(".") != 0) {
            target = "." + target;
        }

        let oLastInst = this.getLastInstruction();
        if (oLastInst != null) {
            if ((oLastInst["instruction"] === instruction) && 
                (oLastInst["target"] === target) &&
                (oLastInst["groupIndex"] == groupIndex)) {
                    bReturn = true;
            }
        }
    
        return bReturn;
    }

    /**
     * Add an Update Page Instruction
     * @param {String} target 
     * @param {String} refName 
     * @param {*} value 
     */
    addAnUpdatePageInstruction( target, refName, value ) {
        let oInstruction = this.getEmbeddedPageInstruction(target);
        if (oInstruction != null) {
            let oContent = oInstruction["content"];
            oContent[refName] = value;
        }
        else {
            let oInstruction = new Object();
            oInstruction["instruction"] = "UPDATE";
            oInstruction["target"] = target;

            let oContent = new Object();
            oContent[refName] = value;

            oInstruction["content"] = oContent;
 
            let arPI = this.oPI["pageInstructions"];

            arPI.push(oInstruction);

            this.oPI["pageInstructions"] = arPI;
        }

    }

    /**
     * Get Embedded Page Instruction
     * @param {String} target 
     * @returns {Object}
     */
    getEmbeddedPageInstruction(target) {
        let oReturn = null;
        let arPI = this.oPI["pageInstructions"];
        for (let index in arPI) {

            if (arPI[index]["target"] === target) {
                return arPI[index];
            }
        }

        return oReturn;       
    }

    /**
     * 
     * @param {String} sRef 
     * @param {String} sValue 
     * @param {String} sCaseID 
     * @param {String} sRefType 
     */
    updateEmbeddedPageInstructionState( sRef, sValue ) {

        let oTargetInfo = ReferenceHelper.getTargetPageAndRef(sRef);

        this.addAnUpdatePageInstruction(oTargetInfo["pageName"], oTargetInfo["propName"], sValue);
    }

    /**
     * 
     * @param {String} sRef 
     * @param {String} sValue 
     * @param {String} sCaseID 
     * @param {String} sRefType 
     */
    updatePageInstructionState( sRef, sValue, sRefType ) {

        let oTargetInfo = ReferenceHelper.getTargetAndIndex(sRef);
        let bHasLast = false;

        // check if there is already if the last entry in page instructions is an update for this target and index
        // if so, we can update it, otherwise, need to create a new one

        // test to see if group, if we think is a group, ok if not, might need to test both group and list
        if (sRefType == refTypes.LIST) {
            const nIndex = parseInt(oTargetInfo["index"]);

            // this happens when we are page in a pagelist, so update the page not the pagelist
            if(isNaN(nIndex)){
                this.updateEmbeddedPageInstructionState(sRef, sValue);
                return;
            }
            bHasLast = this.isLastListInstruction("UPDATE", oTargetInfo["target"], nIndex);
        }
        else if (sRefType == refTypes.GROUP) {
            // this happens when we are page in a pagegroup, so update the page not the pagegroup
            if(oTargetInfo["index"] === undefined || oTargetInfo["index"] === null || oTargetInfo["index"] === ""){
                this.updateEmbeddedPageInstructionState(sRef, sValue);
            }
            bHasLast = this.isLastGroupInstruction("UPDATE", oTargetInfo["target"], oTargetInfo["index"]);
        }

        if (bHasLast) {
            // get content
            let oContent = this.getLastInstructionContent();
            oContent[oTargetInfo["propRef"]] = sValue;

            this.updateLastInstructionContent(oContent);
        }
        else {
            let oContent = new Object();
            oContent[oTargetInfo["propRef"]] = sValue;

            // create a new update
            if (sRefType == refTypes.LIST) {
                let nIndex = parseInt(oTargetInfo["index"]);
                this.addAListInstruction("UPDATE", oTargetInfo["target"], nIndex, oContent);
            }
            else if (sRefType == refTypes.GROUP) {
                this.addAGroupInstruction("UPDATE", oTargetInfo["target"], oTargetInfo["index"], oContent);
            }
        }   
    }

    /**
     * Update PI info.  Going with approach to always update the PI and then later determine which
     *  approach to utiize on the DX API transaction based on application state set.
     * @param {string} sRef
     * @param {string} sValue
     * @param {string} sRefType
     * @return {boolean}
     */
     updatePageInstructions(sRef, sValue, sRefType) {

        let bUpdatedPI = false;
        if (sRefType != null && 
            (sRefType == refTypes.LIST) || (sRefType == refTypes.GROUP)) {

            // ignore ALL, because APPEND and INSERT are taken care of in repeating grid
            if (sRef != "ALL") {
                this.updatePageInstructionState(sRef, sValue, sRefType);
            }
            bUpdatedPI = true;
        } else if (sRef.indexOf("(") >= 0) {
            // is a page list/group
            this.updatePageInstructionState(sRef, sValue, sRefType);
            bUpdatedPI = true;
        }

        if (sRefType == null && sRef.indexOf(".") > 0) {
            this.updateEmbeddedPageInstructionState(sRef, sValue);

            bUpdatedPI = true;
        }
        return bUpdatedPI;
    }

    /**
     *
     * @param {String} sRefType 
     * @param {String} sInstructions 
     * @param {String} sTarget 
     * @param {String} sIndex 
     * @param {Object} oContent 
     */
    updateGridPI(sRefType, sInstructions, sTarget, sIndex, oContent) {
        if (sRefType == refTypes.LIST) {
            let nIndex = parseInt(sIndex);
            this.addAListInstruction(sInstructions, sTarget, nIndex, oContent);
        } else {
            this.addAGroupInstruction(sInstructions, sTarget, sIndex, oContent);
        }
    }


}



export { PageInstructions };