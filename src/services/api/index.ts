export * from './client';
export * from './finance.api';
export * from './academic.api';
export * from './clinical.api';
export * from './campus.api';
export * from './compliance.api';

// Full aggregated API facade preserving all legacy endpoints and modern slices
export { api, lmsApi } from '../api';
export { default } from '../api';
