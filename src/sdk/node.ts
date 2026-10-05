import { SecurityNodeHook, type NodeHook } from '../security/node-hook';

export interface NodeHooks {
  security: NodeHook;
}

export function createDefaultNodeHooks(): NodeHooks {
  return { security: new SecurityNodeHook() };
}
