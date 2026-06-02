import express from 'express';
import 'dotenv/config';
declare module 'express-session' {
    interface SessionData {
        userId?: number;
    }
}
declare const privileges: {
    student: number;
    parent: number;
    teacher: number;
    admin: number;
};
export declare function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction, permissionLevel: number): Promise<boolean>;
export declare function roleAuthority(requiredRole: keyof typeof privileges): number;
export {};
//# sourceMappingURL=auth.d.ts.map