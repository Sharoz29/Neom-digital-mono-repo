import { NstLibsModule } from '@neom/nst-libs';
import { UserController } from './user.controller';
import { UserService } from './user.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [NstLibsModule],
  controllers: [UserController],
  providers: [UserService],
//   exports: [UserController],
})
export class UserModule {}
