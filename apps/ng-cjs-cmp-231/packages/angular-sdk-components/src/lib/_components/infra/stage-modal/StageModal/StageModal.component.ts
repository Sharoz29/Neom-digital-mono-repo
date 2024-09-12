import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-stage-modal',
  templateUrl: './StageModal.component.html',
  styleUrls: ['./StageModal.component.scss']
})
export class StageModalComponent {
  stageName: string;

  constructor(
    public dialogRef: MatDialogRef<StageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.stageName = data.stageName;
  }

  onClose(): void {
    this.dialogRef.close();
  } 
}