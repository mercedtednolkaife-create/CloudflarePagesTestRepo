import worker, { Env } from '../../src/worker';

export interface PagesContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, any>;
  passThroughOnException: () => void;
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const request = context.request;
  const env = context.env;
  const ctx = {
    waitUntil: (promise: Promise<any>) => context.waitUntil(promise),
    passThroughOnException: () => context.passThroughOnException(),
  };

  return worker.fetch(request, env, ctx);
};

