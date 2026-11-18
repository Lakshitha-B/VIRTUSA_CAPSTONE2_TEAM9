// ─── Centralized Error-Handling Middleware ────────────────────────────────────
// Must be registered LAST in Express (after all routes)

// ─── 404 Handler — route not found ───────────────────────────────────────────
export const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
export const errorHandler = (err, req, res, next) => {
    // Determine status code
    let statusCode = err.statusCode || err.status || 500;

    // Handle CORS errors specifically
    if (err.message && err.message.startsWith("CORS policy")) {
        statusCode = 403;
    }

    // Handle Multer file errors (will be used in upload module)
    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 413;
        err.message = "File is too large. Maximum allowed size exceeded.";
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        statusCode = 400;
        err.message = "Unexpected file field. Please upload using the correct form field.";
    }

    // Handle JSON parse errors
    if (err.type === "entity.parse.failed") {
        statusCode = 400;
        err.message = "Invalid JSON in request body.";
    }

    // Consistent JSON error response format
    res.status(statusCode).json({
        success: false,
        error: {
            code: statusCode,
            type: getErrorType(statusCode),
            message: err.message || "An unexpected server error occurred.",
            ...(process.env.NODE_ENV === "development" && { stack: err.stack })
        }
    });
};

// ─── Helper: Map status code to a readable error type ────────────────────────
const getErrorType = (code) => {
    const types = {
        400: "BAD_REQUEST",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        413: "PAYLOAD_TOO_LARGE",
        415: "UNSUPPORTED_MEDIA_TYPE",
        422: "UNPROCESSABLE_ENTITY",
        429: "RATE_LIMIT_EXCEEDED",
        500: "INTERNAL_SERVER_ERROR",
        503: "SERVICE_UNAVAILABLE"
    };
    return types[code] || "ERROR";
};
