import { cookieAuth, AuthedRequest } from './auth';
import { Request as RRequest, Router } from 'itty-router';
import { Database } from '@cloudflare/d1';

async function readRequestBody(request: Request) {
    const { headers } = request;
    const contentType = headers.get('content-type') || '';

    if (contentType === 'application/x-www-form-urlencoded') {
        const formData = await request.formData();
        const body: any = {};
        for (const entry of formData.entries()) {
            body[entry[0]] = entry[1];
        }
        return body;
    } else {
        return undefined;
    }
}

export const routeTimers = (router: Router) => {
    router.get('/api/timers', cookieAuth, async (request: AuthedRequest, env: any) => {
        const { results } = await new Database(env.D1).prepare(
            `SELECT id, description, datetime, created_date, created_by FROM timers WHERE created_by = ?1 ORDER BY datetime`)
            .bind(request.user.sub)
            .all();
        return new Response(JSON.stringify(results), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    });

    router.post('/api/timers', cookieAuth, async (request: AuthedRequest, env: any) => {
        const form = await readRequestBody(request);
        console.log(form);
        const response = await new Database(env.D1).prepare(
            `INSERT INTO timers (description, datetime, created_date, created_by) VALUES (?1, ?2, ?3, ?4)`)
            .bind(form['description'], form['datetime'], new Date().toISOString(), request.user.sub)
            .run();
        console.log('Added new timer: ', response.lastRowId, response.changes);

        const baseURL = new URL(request.url).origin;
        return new Response(null, {
            status: 201,
            headers: {
                'location': baseURL
            }
        });
    });

    router.delete('/api/timers/:id', cookieAuth, async (request: AuthedRequest, env: any) => {
        const id = (request as RRequest).params?.id;
        if (id === undefined) {
            return new Response('Bad Request',  { status: 400 });
        }
        const { results } = await new Database(env.D1).prepare(
            `DELETE FROM timers WHERE id = ?1 AND created_by = ?2`)
            .bind(id, request.user.sub)
            .run();
        return new Response(JSON.stringify(results), {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    });
}