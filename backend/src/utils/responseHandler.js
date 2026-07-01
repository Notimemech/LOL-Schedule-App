/**
 * Format success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {any} data - Payload
 */
export const sendSuccess = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Format error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} error - Detailed error or stack trace
 */
export const sendError = (res, statusCode, message, error = null) => {
    const response = {
        success: false,
        message,
    };
    
    if (error && process.env.NODE_ENV !== 'production') {
        response.error = error;
    }
    
    return res.status(statusCode).json(response);
};
