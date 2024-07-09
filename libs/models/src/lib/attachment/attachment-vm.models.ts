import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { BaseModelVm } from '../base.modelvm';

export class AttachmentVm extends BaseModelVm {
  @ApiProperty()
  name!: string;

  // Create and add more VmModel Properties below:
  // !Note that if you want to map a different name of property in Vm from the Model
  // !Then use the mapper service to implement the custom mapping.

  // Model Getters and Setters
}

export class AttachmentCreateVm extends OmitType(AttachmentVm, [
  'createdAt',
  'updatedAt',
  'id',
]) {}
