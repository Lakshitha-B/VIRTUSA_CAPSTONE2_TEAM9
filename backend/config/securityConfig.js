import cors from "cors";
import helmet from "helmet";

// ─── CORS Configuration ───────────────────────────────────────────────────────
// Only allow requests from the authorized React frontend origin
export const corsConfig = cors({
    origin: (origin, callback) => {
        const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
        // Allow requests with no origin (e.g. curl, Postman, server-to-server)
        if (!origin || origin === allowedOrigin) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: Origin '${origin}' is not allowed.`));
        }
    },
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
    optionsSuccessStatus: 200
});

// ─── Helmet Security Headers Configuration ────────────────────────────────────
// Adds HTTP headers to protect against XSS, Clickjacking, MIME-sniffing etc.

export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'self'"],
            frameAncestors: ["'self'", "http://localhost:5173"]
        }
    },
    frameguard: false,
    crossOriginResourcePolicy: {
        policy: "cross-origin"
    },
    crossOriginEmbedderPolicy: false
});


