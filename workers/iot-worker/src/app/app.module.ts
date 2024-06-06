import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IotMqttDomainModule } from 'libs/domain-libs/src/lib/iot-mqtt/iot-mqtt-domain.module';

@Module({
  imports: [IotMqttDomainModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: 'HOSTID',
    useValue: Math.round((Math.random()*100))
  }],
})
export class AppModule {}
