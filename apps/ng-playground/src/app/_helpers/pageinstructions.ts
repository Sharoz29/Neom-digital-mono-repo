export class PageInstructions {

    oPageInstructions: Record<string, any>;

    constructor() {
        this.oPageInstructions = JSON.parse('{"pageInstructions": []}');

    }


    clearPageInstructions() {
        this.oPageInstructions = JSON.parse('{"pageInstructions": []}');

    }

    getPageInstructions() : Record<string, any> {
        return this.oPageInstructions;
    }

    addAListInstruction(instruction: string, target: string, listIndex: number, content: Record<string, any>) {
        const oInstruction: Record<string, any> = new Object();
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

        const arPI : Array<object> = this.oPageInstructions["pageInstructions"];

        arPI.push(oInstruction);

        this.oPageInstructions["pageInstructions"] = arPI;

    }

    // generic, any last instruction
    getLastInstruction(): Record<string, any> | null {
        let oReturn = null;
        const arPI : Array<object> = this.oPageInstructions["pageInstructions"];
        if (arPI.length > 0) {
            oReturn = arPI[arPI.length -1];
        }

        return oReturn;
    }

    isLastListInstruction(instruction: string, target: string, listIndex: number) : boolean {
        let bReturn = false;

        if (target.indexOf(".") != 0) {
            target = "." + target;
        }

        const oLastInst = this.getLastInstruction();
        if (oLastInst != null) {
            if ((oLastInst["instruction"] === instruction) && 
                (oLastInst["target"] === target) &&
                (oLastInst["listIndex"] == listIndex)) {
                    bReturn = true;
            }
        }
    
        return bReturn;

    }

    getLastInstructionContent() : Record<string, any> {
        let oReturn = null;
        const oLast = this.getLastInstruction();
        if (oLast != null) {
            oReturn = oLast["content"];
        }

        return oReturn;
    }

    updateLastInstructionContent(content: Record<string, any>) {
        const oLast: Record<string, any> = this.getLastInstruction() || {};
        oLast["content"] = content;
    }




    addAGroupInstruction(instruction: string, target: string, groupIndex: string, content: Record<string, any>) {
        const oInstruction: Record<string, any> = new Object();
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

        const arPI : Array<object> = this.oPageInstructions["pageInstructions"];

        arPI.push(oInstruction);

        this.oPageInstructions["pageInstructions"] = arPI;
    }

    isLastGroupInstruction(instruction: string, target: string, groupIndex: string) : boolean {
        let bReturn = false;

        if (target.indexOf(".") != 0) {
            target = "." + target;
        }

        const oLastInst = this.getLastInstruction();
        if (oLastInst != null) {
            if ((oLastInst["instruction"] === instruction) && 
                (oLastInst["target"] === target) &&
                (oLastInst["groupIndex"] == groupIndex)) {
                    bReturn = true;
            }
        }
    
        return bReturn;

    }








    addAnUpdatePageInstruction(target: string, refName: string, value: any) {
        const oInstruction: Record<string, any> = this.getEmbeddedPageInstruction(target) || {};
        if (oInstruction != null) {
            const oContent: Record<string, any> = oInstruction["content"];
            oContent[refName] = value;
        }
        else {
            const oInstruction: Record<string, any> = new Object();
            oInstruction["instruction"] = "UPDATE";
            oInstruction["target"] = target;

            const oContent: Record<string, any> = new Object();
            oContent[refName] = value;

            oInstruction["content"] = oContent;
 
            const arPI : Array<object> = this.oPageInstructions["pageInstructions"];

            arPI.push(oInstruction);

            this.oPageInstructions["pageInstructions"] = arPI;
        }

    }

    getEmbeddedPageInstruction(target: string) {
        const oReturn = null;
        const arPI : Array<Record<string, any>> = this.oPageInstructions["pageInstructions"];
        for (const index in arPI) {

            if (arPI[index]["target"] === target) {
                return arPI[index];
            }
        }

        return oReturn;       
    }

}
