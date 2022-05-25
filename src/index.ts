import { routeAdmin } from './admin';
import { routeUsers } from './auth';
import { Router } from 'itty-router';
import { routeTimers } from './timers';

const router = Router();

routeAdmin(router);
routeUsers(router);
routeTimers(router);

// 404 for everything else
router.all('/api/*', () => new Response('Not Found.', { status: 404 }))

export default {
    fetch: router.handle
};
