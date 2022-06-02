import { parse } from 'cookie';
import jwt_decode from 'jwt-decode';
import { Router } from 'itty-router';
import { User } from './db';
import { Database } from '@cloudflare/d1';

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

    await new Database(env.D1).prepare(
        `INSERT OR IGNORE INTO users (sub, email) VALUES (?1, ?2)`
    ).bind(user.sub, user.email).run();
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
        const { results } = await new Database(env.D1).prepare(
            `SELECT sub, email FROM users`,
        ).all();
        return new Response(JSON.stringify(results), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    })
}
