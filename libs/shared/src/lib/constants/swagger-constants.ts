export enum SwaggerMessages {
  NOT_FOUND = 'Not Found: The requested resource could not be found but may be available in the future.',
  BAD_GATEWAY = 'Bad Gateway: Something went wrong with the Server.',
  BAD_REQUEST = 'Bad Request: The request could not be understood or was missing required parameters.',
  UNAUTHORIZED = 'Unauthorized: The request has not been applied because it lacks valid authentication credentials for the target resource.',
  FORBIDDEN = 'Forbidden: The server understood the request, but is refusing to fulfill it.',
  SUCCESS = 'Success: Successfully retrieved the requested resource.',
}

export const swagSuccessDynamic = (thing: string, type: any = Object, isArray = false) => {
  return {
    isArray,
    type,
    description:
      `Successfully retrieved the requested ${thing || 'resource'}.`,
  };
}

export const swagErrHeader = () => ({
  name: 'throw-error',
  schema: {
    type: 'integer',
    enum: [400, 404, 502],
  },
  description: 'Select status code to throw required mock error',
});

