import mongoose from 'mongoose';
import { TErrorSource, TGenericErrorResponse } from '../interface/error';

const handleValidationError = (err: mongoose.Error.ValidationError): TGenericErrorResponse => {
  const errorSource: TErrorSource = Object.values(err.errors).map((value) => {
    return {
      path: value?.path,
      message: value?.message,
    };
  });

  const statusCode = 400;
  return {
    statusCode,
    errorSource,
    message: 'Validation Error',
  };
};

export default handleValidationError;
