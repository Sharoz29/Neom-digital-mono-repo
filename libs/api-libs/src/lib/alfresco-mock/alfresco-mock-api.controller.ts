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
  Header,
  Req,
  UseInterceptors,
  Logger,
  Res,
} from '@nestjs/common';
import { ApiParam, ApiBody, ApiTags, ApiResponse, ApiOperation, ApiHeader, ApiBadRequestResponse, ApiBadGatewayResponse, ApiNotFoundResponse, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';

import { Observable, of } from 'rxjs';

import { AlfrescoMockApiService } from './alfresco-mock-api.service';
import { swagErrHeader, SwaggerMessages, swagSuccessDynamic } from '@neom/shared';
import { ThrowErrorInterceptor } from '@neom/nst-libs/lib/interceptors/throw-custom-error.interceptor';
import { docShareSchema } from './schemas';

@Controller('documents')
@ApiTags('Alfresco Mock API')
@UseInterceptors(ThrowErrorInterceptor)
// @CustomizeLogInterceptor({module: 'AlfrescoMock'})
export class AlfrescoMockApiController {
  logger = new Logger('MOCK API');
  constructor(
    private readonly _alfrescoMockApiService: AlfrescoMockApiService
  ) {}

  // @Get('list/shared')
  // @ApiHeader(swagErrHeader())
  // @ApiOkResponse(
  //   swagSuccessDynamic(
  //     'list of documents shared with the current user.',
  //     null,
  //     true
  //   )
  // )
  // @ApiBadRequestResponse({
  //   description: SwaggerMessages.BAD_REQUEST,
  // })
  // @ApiBadGatewayResponse({
  //   description: SwaggerMessages.BAD_GATEWAY,
  // })
  // @ApiNotFoundResponse({
  //   description: SwaggerMessages.NOT_FOUND,
  // })
  // @ApiOperation({
  //   summary: 'Get list of Shared Documents',
  //   description:
  //     'Get list of Shared Documents using a GET call, pass digitalId and language in headers as URL Encoded Plain text',
  // })
  // @ApiHeader({
  //   name: 'language',
  //   description: 'document language',
  //   required: false,
  // })
  // @ApiHeader({
  //   name: 'digitalid',
  //   description: 'digital id of the document',
  //   required: true,
  // })
  // getSharedDocumentsList(@Req() req: any): Observable<any> {
  //   if (!req.headers['digitalid']) {
  //     throw new HttpException(
  //       'Missing required headers',
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }
  //   this.logger.log('Get Shared Documents List API Called');
  //   return of([{}]);
  // }

  // @Post('search')
  // @ApiHeader(swagErrHeader())
  // @ApiOkResponse({
  //   ...swagSuccessDynamic('list of documents', null, false),
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       status: {
  //         type: 'string',
  //         default: 'success',
  //       },
  //       data: {
  //         type: 'object',
  //         properties: {
  //           totalEntries: {
  //             type: 'number',
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // @ApiBadRequestResponse({
  //   description: SwaggerMessages.BAD_REQUEST,
  // })
  // @ApiBadGatewayResponse({
  //   description: SwaggerMessages.BAD_GATEWAY,
  // })
  // @ApiNotFoundResponse({
  //   description: SwaggerMessages.NOT_FOUND,
  // })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       searchTerm: {
  //         type: 'string',
  //         description: 'search string',
  //       },
  //       include: {
  //         type: 'string',
  //         description: 'property names',
  //       },
  //     },
  //   },
  //   description: 'Search a Document using request body',
  //   required: true,
  // })
  // @ApiOperation({
  //   summary: 'Post method for alfresco-mock',
  //   description: 'Search a Document using request body',
  // })
  // documentSearch(@Body() body: any): Observable<any> {
  //   this.logger.log('Searching the Document API Called');
  //   return of([{}]);
  // }

  @Post('add')
  @ApiHeader(swagErrHeader())
  @ApiCreatedResponse(
    swagSuccessDynamic('list of documents to share', null, true)
  )
  @ApiBadRequestResponse({
    description: SwaggerMessages.BAD_REQUEST,
  })
  @ApiBadGatewayResponse({
    description: SwaggerMessages.BAD_GATEWAY,
  })
  @ApiNotFoundResponse({
    description: SwaggerMessages.NOT_FOUND,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string' },
        caseTypeId: { type: 'string' },
        properties: {
          items: {
            properties: {
              name: { type: 'string' },
              value: { type: 'string' },
            },
          },
        },
        content: {
          type: 'object',
          properties: {
            base64data: {
              type: 'string'
            }
          }
        },
      },
    },
    description: 'Share Documents with other users',
    required: true,
  })
  @ApiOperation({
    summary: 'Post method for alfresco-mock',
    description: 'Search a Document using request body',
  })
  documentShare(@Req() req: any, @Body() body: any): Observable<any> {
    this.logger.log('Document Uploaded');
    return of({
      status: 'success',
      data: {
        documentItem: [
          {
            docRef: '5063bbfe-0856-4f39-b55d-88e7e5a4b8de',
            docNumber: 'F1579',
            docName: 'DG_1716136739074.jpg',
            docType: 'Passport',
            docVersion: '1.0',
          },
        ],
      },
    });
  }

  @Get(':docRef/download')
  @ApiHeader(swagErrHeader())
  @ApiOkResponse(swagSuccessDynamic('downloaded document.', null, false))
  @ApiBadRequestResponse({
    description: SwaggerMessages.BAD_REQUEST,
  })
  @ApiBadGatewayResponse({
    description: SwaggerMessages.BAD_GATEWAY,
  })
  @ApiNotFoundResponse({
    description: SwaggerMessages.NOT_FOUND,
  })
  @ApiOperation({
    summary: 'Get Document Download',
    description:
      'Get the download of Document using a GET call, pass docRef in path',
  })
  @ApiParam({
    name: 'docRef',
    description: 'enter docRef in path',
    required: true,
  })
  getDocumentByRef(@Param('docRef') docRef: string, @Res() res: any) {
    res.setHeader('Content-Type', 'application/text');
    res.setHeader('Content-Disposition', `attachment; filename=${docRef}.txt`);
    this.logger.log('Sending Document for Download API Called');
    res.send(Buffer.alloc(5, 'A'));
  }

  @Get(':docRef/view')
  @ApiHeader(swagErrHeader())
  @ApiOkResponse({
    ...swagSuccessDynamic('View document.', null, false),
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            docStatus: { type: 'string' },
            docRef: { type: 'string' },
            docType: { type: 'string' },
            groups: {
              items: {
                properties: {
                  name: { type: 'string' },
                  order: { type: 'string' },
                  properties: {
                    items: {
                      properties: {
                        name: { type: 'string' },
                        order: { type: 'string' },
                        mendatory: { type: 'string' },
                        title: { type: 'string' },
                        value: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: SwaggerMessages.BAD_REQUEST,
  })
  @ApiBadGatewayResponse({
    description: SwaggerMessages.BAD_GATEWAY,
  })
  @ApiNotFoundResponse({
    description: SwaggerMessages.NOT_FOUND,
  })
  @ApiOperation({
    summary: 'View Document',
    description: 'View Document using a GET call, pass docRef in path',
  })
  @ApiParam({
    name: 'docRef',
    description: 'enter docRef in path',
    required: true,
  })
  @ApiHeader({
    name: 'language',
    description: 'document language',
    required: false,
  })
  @ApiHeader({
    name: 'digitalid',
    description: 'digital id of the document',
    required: true,
  })
  viewDocumentByRef(@Param('docRef') docRef: string) {
    this.logger.log('Document View API Called');
    return of({
      status: 'success',
      data: {
        docStatus: 'REVIEW',
        docRef: docRef,
        docType: 'Residence ID',
        groups: [
          {
            name: 'Primary Details',
            order: '2',
            properties: [
              {
                name: 'neom:docNumber',
                order: '8',
                mandatory: 'true',
                title: 'Document Number',
                datatype: 'Text',
                value: '096733106',
              },
              {
                name: 'neom:fullName',
                order: '7',
                mandatory: 'false',
                title: 'Full Name',
                datatype: 'Text',
                value: 'VARMA RUDHVI RAVI',
              },
              {
                name: 'neom:dob',
                order: '6',
                mandatory: 'false',
                title: 'Date of Birth',
                datatype: 'Date',
                value: '20/04/2019',
              },
              {
                name: 'neom:placeOfIssue',
                order: '5',
                mandatory: 'true',
                title: 'Place of Issue',
                datatype: 'Text',
                value: 'United Arab Emirates',
              },
              {
                name: 'neom:nationality',
                order: '3',
                mandatory: 'true',
                title: 'Nationality',
                datatype: 'Text',
                value: 'India',
              },
              {
                name: 'neom:sex',
                order: '1',
                mandatory: 'true',
                title: 'Gender',
                datatype: 'Text',
                value: 'M',
              },
              {
                name: 'neom:expiryDate',
                order: '2',
                mandatory: 'true',
                title: 'Expiry Date',
                datatype: 'Date',
                value: '30/09/2021',
              },
            ],
            groups: [
              {
                name: '',
                order: '',
                groups: [
                  {
                    name: '',
                    order: '',
                  },
                ],
              },
            ],
          },
          {
            name: 'Other Details',
            order: '1',
            properties: [
              {
                name: 'neom:issueDate',
                order: '1',
                mandatory: 'true',
                title: 'Issue Date',
                datatype: 'Date',
                value: '15/05/2024',
              },
              {
                name: 'neom:address',
                order: '2',
                mandatory: 'true',
                title: 'Address',
                datatype: 'Text',
                value: 'jkc',
              },
            ],
            groups: [
              {
                name: '',
                order: '',
                groups: [
                  {
                    name: '',
                    order: '',
                  },
                ],
              },
            ],
          },
        ],
        favorite: 'false',
      },
    });
  }

  @Delete(':docRef/remove')
  @ApiHeader(swagErrHeader())
  @ApiHeader({
    name: 'digitalid',
    description: 'digital id of the document',
    required: true,
  })
  @ApiOkResponse({
    description: 'Document Deleted',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'string',
        },
        data: {
          type: 'object',
          properties: {
            docRef: {
              type: 'string',
            },
            docDeletionStatus: {
              type: 'string',
              default:
                'Document removed successfully which may take a few seconds to reflect.',
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: SwaggerMessages.BAD_REQUEST,
  })
  @ApiBadGatewayResponse({
    description: SwaggerMessages.BAD_GATEWAY,
  })
  @ApiNotFoundResponse({
    description: SwaggerMessages.NOT_FOUND,
  })
  @ApiOperation({ summary: 'Delete method for alfresco-mock' })
  @ApiParam({ name: 'docRef', required: true })
  delete(@Req() req: any, @Param() { docRef }: { docRef: string }) {
    if (!req.headers['digitalid']) {
      throw new HttpException(
        'Missing required headers',
        HttpStatus.BAD_REQUEST
      );
    }
    this.logger.log('Get Shared Documents List API Called');

    return of({
      status: 'success',
      data: {
        docRef: docRef,
        docDeletionStatus:
          'Document removed successfully which may take a few seconds to reflect.',
      },
    });
  }
}
