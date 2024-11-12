


export class IotMqttDto {
  pattern: string;
  message: string;


  constructor(data: any) {
    this.pattern = data.pattern;
    this.message = data.message;
  }

}

export class CreateAlarmDto {
  source: { id: string };
  type: string;
  text: string;
  severity: string;
  status: string;
  time: string;

  constructor(data: any) {
    this.source = data.source;
    this.type = data.type;
    this.text = data.text;
    this.severity = data.severity;
    this.status = data.status;
    this.time = data.time;
  }
}

/**
 * Alarm Update DTO
 */
export class UpdateAlarmDto {
  status?: string;
  severity?: string;
  text?: string;

  constructor(data: any) {
    this.status = data.status;
    this.severity = data.severity;
    this.text = data.text;
  }
}

/**
 * DTO for alarm queries (e.g., remove or retrieve alarm collections)
 */
export class AlarmQueryDto {
  fragmentType?: string;
  sourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;

  constructor(data: any) {
    this.fragmentType = data.fragmentType;
    this.sourceId = data.sourceId;
    this.dateFrom = data.dateFrom;
    this.dateTo = data.dateTo;
    this.status = data.status;
  }
}
