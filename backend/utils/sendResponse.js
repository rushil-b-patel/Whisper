export const sendSuccess = (res, status = 200, message, data = {}) => {
    return res.status(status).json({
        success: true,
        message,
        ...data,
    });
};

export const sendError = (res, status = 500, message = 'Something went wrong', extra = {}) => {
    return res.status(status).json({
        success: false,
        message,
        ...extra,
    });
};
