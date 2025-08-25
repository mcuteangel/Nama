declare module '*.json' {
  const value: Record<string, any>;
  export default value;
}

declare module 'moment-jalaali';
declare module 'moment' {
  import { Moment as MomentType } from 'moment';
  export type Moment = MomentType;
}