import 'dotenv/config';
declare module 'express-session' {
    interface SessionData {
        userId?: number;
    }
}
//# sourceMappingURL=main.d.ts.map