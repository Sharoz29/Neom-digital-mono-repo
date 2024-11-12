import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { BaseModelVm } from '../base.modelvm';

export class IotMqttVm extends BaseModelVm {
  @ApiProperty()
  message?: string;
  @ApiProperty()
  pattern?: string;

  // Create and add more VmModel Properties below:
  // !Note that if you want to map a different name of property in Vm from the Model
  // !Then use the mapper service to implement the custom mapping.

  // Model Getters and Setters
}

export class CreateAlarmVm extends BaseModelVm {
  @ApiProperty({
    example: { id: '251982' },
    description: 'Source of the alarm',
  })
  source?: { id: string };

  @ApiProperty({
    example: 'c8y_UnavailabilityAlarm',
    description: 'Type of alarm',
  })
  type?: string;

  @ApiProperty({
    example: 'No data received from the device within the required interval.',
    description: 'Alarm message text',
  })
  text?: string;

  @ApiProperty({ example: 'MAJOR', description: 'Severity of the alarm' })
  severity?: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Status of the alarm' })
  status?: string;

  @ApiProperty({
    example: '2020-03-19T12:03:27.845Z',
    description: 'Time of alarm occurrence',
  })
  time?: string;
}

/**
 * Alarm Update VM
 */
export class UpdateAlarmVm extends BaseModelVm {
  @ApiProperty({
    description: 'Source of the alarm',
    example: { id: '251982' },
  })
  source?: { id: string };

  @ApiProperty({
    description: 'New alarm status',
    example: 'ACKNOWLEDGED',
  })
  status?: string;

  @ApiProperty({
    description: 'Updated severity level',
    example: 'MINOR',
  })
  severity?: string;

  @ApiProperty({
    description: 'Updated text',
    example: 'text',
  })
  text?: string;
}

export class IotMqttCreateVm extends OmitType(IotMqttVm, [
  'createdAt',
  'updatedAt',
  'id',
]) {}
