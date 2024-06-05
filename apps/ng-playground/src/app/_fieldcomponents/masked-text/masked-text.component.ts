import { Component, Input, OnInit } from "@angular/core";
import { ReferenceHelper } from "../../_helpers/reference-helper";

@Component({
  selector: "app-masked-text",
  templateUrl: "./masked-text.component.html",
  styleUrls: ["./masked-text.component.scss"],
})
export class MaskedTextComponent implements OnInit {
  @Input() fieldComp: any;
  @Input() noLabel!: boolean;

  showLabel$ = false;

  constructor(private refHelper: ReferenceHelper) {
    // empty
  }

  ngOnInit(): void {
    this.fieldComp.label = this.refHelper.htmlDecode(this.fieldComp.label);
    if (this.noLabel) {
      this.fieldComp.label = "";
      this.showLabel$ = false;
    } else {
      if (this.fieldComp.label != "") {
        this.showLabel$ = true;
      } else if (this.fieldComp.label == "" && this.fieldComp.labelReserveSpace) {
        this.showLabel$ = true;
      }
    }
  }
}
