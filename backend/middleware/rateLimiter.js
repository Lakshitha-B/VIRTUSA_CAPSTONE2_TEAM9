import rateLimit from "express-rate-limit";

// General API rate limiter — 100 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 429,
            type: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later."
        }
    }
});

// File upload rate limiter — stricter: 25 uploads per 15 minutes
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 25,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 429,
            type: "UPLOAD_LIMIT_EXCEEDED",
            message: "Upload limit exceeded. You can upload up to 25 files every 15 minutes. Please try again later."
        }
    }
});
