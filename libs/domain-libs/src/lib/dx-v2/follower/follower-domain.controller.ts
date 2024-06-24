import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiParam,
  ApiBody,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { FollowerVm, PSFOLLOWER } from '@neom/models';
import { FollowerDomainService } from './follower-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('follower')
@ApiTags('follower')
export class FollowerDomainController {
  constructor(private readonly _followerDomainService: FollowerDomainService) {}

  @MessagePattern(PSFOLLOWER.GETCASEFOLLOWERS)
  getCaseFollowers(payload: any): Observable<any> {
    return this._followerDomainService.getCaseFollowers(payload);
  }
}
