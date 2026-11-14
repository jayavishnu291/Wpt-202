import { toLocalISOString } from '../../src/data/time';

describe('Local ISO time helper', () => {
  it('formats the timestamp using the phone local offset', () => {
    const getTimezoneOffset = jest
      .spyOn(Date.prototype, 'getTimezoneOffset')
      .mockReturnValue(300);

    try {
      expect(
        toLocalISOString(new Date('2026-01-02T03:04:05.006Z')),
      ).toBe('2026-01-01T22:04:05.006-05:00');
    } finally {
      getTimezoneOffset.mockRestore();
    }
  });
});
