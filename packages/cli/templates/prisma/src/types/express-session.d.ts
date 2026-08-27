// nestforge:feature-file:auth:session
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        user?: {
            id: string;
            email: string;
            role: string;
        };
    }
}