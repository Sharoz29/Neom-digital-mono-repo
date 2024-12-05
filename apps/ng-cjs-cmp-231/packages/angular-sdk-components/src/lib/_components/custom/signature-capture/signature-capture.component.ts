import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, forwardRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { interval } from 'rxjs';
import {
  AngularPConnectData,
  AngularPConnectService,
  ComponentMapperComponent,
  TextInputComponent,
  Utils
} from 'packages/angular-sdk-components/src/public-api';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'signature-pad',
  templateUrl: './signature-capture.component.html',
  styleUrls: ['./signature-capture.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextInputComponent, MatFormFieldModule, MatInputModule, forwardRef(() => ComponentMapperComponent)]
})
export class Pega_Extensions_SignatureCapture implements /*ControlValueAccessor,*/ OnInit, OnDestroy /*, AfterViewInit*/ {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  angularPConnectData: AngularPConnectData = {};
  configProps$: any;

  label$: string = '';
  value$: string = '';
  testId = '';
  controlName$: string;
  signaturePad!: SignaturePad;
  @ViewChild('canvas') canvasEl!: ElementRef;
  bHasForm$ = true;
  bReadonly$ = false;
  componentReference = '';
  actionApi: any;
  propName: any;

  fieldControl = new FormControl('', null);

  constructor(private angularPConnect: AngularPConnectService, private cdRef: ChangeDetectorRef, private utils: Utils) {}

  ngOnInit(): void {
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.controlName$ = this.angularPConnect.getComponentID(this);
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as any;

    this.label$ = this.configProps$.label;

    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
    this.checkAndUpdate();

    if (this.formGroup$) {
      this.formGroup$.addControl(this.controlName$, this.fieldControl);
      this.fieldControl.setValue(this.value$);
      this.bHasForm$ = true;
    } else {
      this.bReadonly$ = true;
      this.bHasForm$ = false;
    }
  }

  ngAfterViewInit(): void {
    if (this.canvasEl) {
      const canvas = this.canvasEl.nativeElement;
      this.signaturePad = new SignaturePad(canvas);
    }
  }
  ngOnDestroy(): void {
    if (this.formGroup$) {
      this.formGroup$.removeControl(this.controlName$);
    }

    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  onStateChange() {
    this.checkAndUpdate();
  }

  checkAndUpdate() {
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as any;

    if (this.configProps$.value != undefined) {
      this.value$ = this.configProps$.value;
    }

    this.testId = this.configProps$.testId;

    this.controlName$ = this.angularPConnect.getComponentID(this);
    this.componentReference = (this.pConn$.getStateProps() as any).value;

    if (this.configProps$.readOnly != undefined) {
      this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.required);
    }

    setTimeout(() => {
      this.cdRef.detectChanges();
    });
    this.fieldControl.enable();

    if (this.angularPConnectData.validateMessage != null && this.angularPConnectData.validateMessage != '') {
      const timer = interval(100).subscribe(() => {
        this.fieldControl.setErrors({ message: true });
        this.fieldControl.markAsTouched();

        timer.unsubscribe();
      });
    }
  }

  signatureOnChange() {
    const base64Data = this.signaturePad.toDataURL();
    this.value$ = base64Data;
    this.formGroup$.get('fieldControl')?.setValue(this.value$);
    const event = { target: { value: this.value$ } };
    this.fieldOnChange(event);
  }
  resetSignature() {
    this.value$ = '';
    this.signaturePad.clear();
    const event = { target: { value: this.value$ } };
    this.fieldOnChange(event);
  }

  fieldOnChange(event: any) {
    this.angularPConnectData.actions?.onChange(this, event);
  }

  fieldOnBlur(event: any) {
    this.angularPConnectData.actions?.onBlur(this, event);
  }
}
