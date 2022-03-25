import { ApiNamespace } from './interfaces';
import { AtomicAssetsNamespace } from './atomicassets';
import { AtomicMarketNamespace } from './atomicmarket';
import { AtomicToolsNamespace } from './atomictools';
import { StandarTokenNamespace } from './standartoken';

export const namespaces: (typeof ApiNamespace)[] = [
    AtomicAssetsNamespace,
    AtomicMarketNamespace,
    AtomicToolsNamespace,
    StandarTokenNamespace
];
