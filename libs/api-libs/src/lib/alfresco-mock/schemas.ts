import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export const docShareSchema: SchemaObject = {
  type: 'object',
  properties: {
    ownerId: {
      type: 'string',
      description: 'Owner ID',
    },
    shareType: {
      type: 'string',
    },
    shareDocuments: {
      items: {
        properties: {
          docRef: {
            type: 'string'
          },
          sharedMode: {
            type: 'string'
          },
          digitalId: {
            type: 'string'
          },
          validity: {
            type: 'string'
          },
          permissions: {
            type: 'object',
            properties: {
              view: {
                type: 'boolean'
              },
              share: {type: 'boolean'},
              download: {
                type: 'boolean'
              }
            }
          },
          sharedFields: {
            items: {
              properties: {
                
              }
            }
          }
        }
      }
    }
  },
};

