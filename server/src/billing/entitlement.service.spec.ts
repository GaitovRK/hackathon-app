import type { Env } from '../config/env';
import { EntitlementService } from './entitlement.service';

const env = { REVENUECAT_SECRET_KEY: 'sk_test_secret' } as Env;
const NOW = Date.parse('2026-01-01T12:00:00Z');

function mockFetchJson(body: unknown, ok = true, status = 200) {
  return jest.fn().mockResolvedValue({ ok, status, json: async () => body });
}

describe('EntitlementService', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('calls RevenueCat with bearer key and returns true for a non-expiring pro entitlement', async () => {
    const fetchMock = mockFetchJson({ subscriber: { entitlements: { pro: { expires_date: null } } } });
    global.fetch = fetchMock as unknown as typeof fetch;
    const svc = new EntitlementService(env);

    await expect(svc.isPro('user-1', NOW)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('https://api.revenuecat.com/v1/subscribers/user-1', {
      headers: { Authorization: 'Bearer sk_test_secret' },
    });
  });

  it('returns true when pro expires in the future and false when expired', async () => {
    global.fetch = mockFetchJson({
      subscriber: { entitlements: { pro: { expires_date: '2026-02-01T00:00:00Z' } } },
    }) as unknown as typeof fetch;
    await expect(new EntitlementService(env).isPro('u', NOW)).resolves.toBe(true);

    global.fetch = mockFetchJson({
      subscriber: { entitlements: { pro: { expires_date: '2025-12-01T00:00:00Z' } } },
    }) as unknown as typeof fetch;
    await expect(new EntitlementService(env).isPro('u', NOW)).resolves.toBe(false);
  });

  it('returns false without a pro entitlement', async () => {
    global.fetch = mockFetchJson({ subscriber: { entitlements: {} } }) as unknown as typeof fetch;
    await expect(new EntitlementService(env).isPro('u', NOW)).resolves.toBe(false);
  });

  it('returns false on non-2xx and on network error', async () => {
    global.fetch = mockFetchJson({}, false, 500) as unknown as typeof fetch;
    await expect(new EntitlementService(env).isPro('u', NOW)).resolves.toBe(false);

    global.fetch = jest.fn().mockRejectedValue(new Error('down')) as unknown as typeof fetch;
    await expect(new EntitlementService(env).isPro('u', NOW)).resolves.toBe(false);
  });

  it('caches results for 60s per user', async () => {
    const fetchMock = mockFetchJson({ subscriber: { entitlements: { pro: { expires_date: null } } } });
    global.fetch = fetchMock as unknown as typeof fetch;
    const svc = new EntitlementService(env);

    await svc.isPro('u', NOW);
    await svc.isPro('u', NOW + 59_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await svc.isPro('u', NOW + 61_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await svc.isPro('other', NOW + 61_000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
