
import {ApiProperty} from '@nestjs/swagger';

export class BaseModelVm{
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  id: string;

  constructor(){
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.id = '';
  }

}