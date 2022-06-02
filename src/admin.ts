import { cookieAuth, AuthedRequest, unauthorizedResponse } from './auth';
import { init, clean } from './db';
import { Router } from 'itty-router';
import { Database } from '@cloudflare/d1';

const withAdmin = (request: AuthedRequest, env: any) => {
    if (request.user.email !== 'cf@devincarr.com') {
        return unauthorizedResponse;
    }
}

export const routeAdmin = (router: Router) => {
    router.get('/api/admin/db/init', cookieAuth, withAdmin, async (request: AuthedRequest, env: any) => {
        // Initialize DB tables
        const response = await init(new Database(env.D1));

        return new Response(JSON.stringify(response), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    });

    router.get('/api/admin/db/clean', cookieAuth, withAdmin, async (request: AuthedRequest, env: any) => {
        // Clean all tables
        const response = await clean(new Database(env.D1));

        return new Response(JSON.stringify(response), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    });
}
