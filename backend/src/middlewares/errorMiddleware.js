import { sendError } from '../utils/responseHandler.js';

export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Handle specific database errors (pg) here if needed
    // Example: Duplicate key value violates unique constraint
    if (err.code === '23505') {
        err.statusCode = 400;
        err.message = 'Duplicate field value entered';
    }

    sendError(res, err.statusCode, err.message, err);
};
