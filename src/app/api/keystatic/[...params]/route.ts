import { makeRouteHandler } from "@keystatic/next/route-handler";

import config from "../../../../../keystatic.config";

/**
 * Keystatic's GitHub OAuth + content API. In local mode this reads and writes
 * /content directly; in GitHub mode it commits on your behalf.
 */
export const { POST, GET } = makeRouteHandler({ config });
