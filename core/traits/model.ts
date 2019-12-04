
import { ExecuteHandler } from '../execute/model';
import { SyncHandler } from '../sync/model';
import { QueryHandler } from '../query/model';

export interface Trait {
  name: string;
  commands: string[];
  execute: {
    [key: string]: ExecuteHandler;
  },
  sync: SyncHandler;
  query?: QueryHandler; // optional until we implement for all existing
}
