import { parse } from 'cookie';
import { query } from '@xtuc/d1';
import jwt_decode from 'jwt-decode';
import { Router } from 'itty-router';
import { User } from './db';

const COOKIE_NAME = 'CF_Authorization';

export interface AuthedRequest extends Request {
    user: User
}

export const unauthorizedResponse = () => new Response('Unauthorized', { status: 401 });

// Auth middleware to parse out the CF_Authorization cookie details 
// and insert user into users table.
export const auth = async (request: AuthedRequest, env: any) => {
    const cookie = parse(request.headers.get('Cookie') || '');

    if (cookie[COOKIE_NAME] === null) {
        return unauthorizedResponse();
    }

    const user = jwt_decode<User>(cookie[COOKIE_NAME]);
    if (user === undefined) {
        return unauthorizedResponse();
    }

    const response = await query(env.D1,
        `INSERT OR IGNORE INTO users (sub, email) VALUES (?1, ?2)`,
        [user.sub, user.email]
    );
    request.user = user
}

// Auth middleware to parse out the CF_Authorization cookie details
export const cookieAuth = async (request: AuthedRequest, env: any) => {
    const cookie = parse(request.headers.get('Cookie') || '');

    if (cookie[COOKIE_NAME] === null) {
        return unauthorizedResponse();
    }

    const user = jwt_decode<User>(cookie[COOKIE_NAME]);
    if (user === undefined) {
        return unauthorizedResponse();
    }

    request.user = user
}

export const routeUsers = (router: Router) => {
    router.get("/api/users/me", auth, async (request: AuthedRequest, env: any) => {
        return new Response(JSON.stringify(request.user), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    })
    
    router.get("/api/users", auth, async (_: Request, env: any) => {
        const data = await query(env.D1, 
            `SELECT sub, email FROM users`,
        );
        return new Response(JSON.stringify(data), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    })
}
