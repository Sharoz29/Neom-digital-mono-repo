import { Pipe, PipeTransform } from "@angular/core";

/**
 * This pipe is added to mask the obfuscated fields at frontend
 * Note: This only applies when FUA is not enabled
 */

@Pipe({
  name: "masked",
})
export class MaskedPipe implements PipeTransform {
  transform(value: string): string {
    if (/●/.test(value)) return value;

    return value.replace(/./g, "●");
  }
}
