import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseObjectPipe implements PipeTransform {
  transform(value: any, { type, metatype }: ArgumentMetadata) {
    if(!value) return;
    
    if (
      type === 'query' &&
      metatype &&
      metatype.name === 'Object' &&
      typeof value === 'string'
    ) {
      return JSON.parse(value);
    }

    return value;
  }
}
