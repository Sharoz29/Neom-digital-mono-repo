


export class IotMqttDto {
  pattern: string;
  message: string;


  constructor(data: any) {
    this.pattern = data.pattern;
    this.message = data.message;
  }

}