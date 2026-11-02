/**
 * Runtime configuration.
 * useMock = true  → every service returns the mock data in src/app/shared/data (no backend needed).
 * useMock = false → services call `${apiUrl}/...` (see API_CONTRACT.md for every endpoint).
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  useMock: true, hashRouting: false,
};
