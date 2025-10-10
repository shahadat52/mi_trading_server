import { TErrorSource, TGenericErrorResponse } from '../interface/error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDuplicateError = (err: any): TGenericErrorResponse => {
  // console.log("dddddddddd",err);
  const match = err.message.match(/"([^"]*)"/)[1];
  const errorSource: TErrorSource = [
    {
      path: '',
      message: match,
    },
  ];
  const statusCode = 400;
  return {
    statusCode,
    message: `${match} is already exists`,
    errorSource,
  };
};

export default handleDuplicateError;
