import { cookieAuth, AuthedRequest, unauthorizedResponse } from './auth';
import { init, clean, migrate } from './db';
import { Router } from 'itty-router';

const withAdmin = (request: AuthedRequest, env: any) => {
    if (request.user.email !== 'cf@devincarr.com') {
        return unauthorizedResponse;
    }
}

export const routeAdmin = (router: Router) => {
    router.get('/api/admin/db/init', cookieAuth, withAdmin, async (request: AuthedRequest, env: any) => {
        // Initialize DB tables
        const response = await init(env.D1);

        return new Response(JSON.stringify(response), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    });

    router.get('/api/admin/db/migrate', cookieAuth, withAdmin, async (request: AuthedRequest, env: any) => {
        // Initialize DB tables
        const response = await migrate(env.D1);

        return new Response(JSON.stringify(response), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    });

    router.get('/api/admin/db/clean', cookieAuth, withAdmin, async (request: AuthedRequest, env: any) => {
        // Clean all tables
        const response = await clean(env.D1);

        return new Response(JSON.stringify(response), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    });
}
