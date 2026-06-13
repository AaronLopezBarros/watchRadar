import { describe, expect, it } from 'vitest';

import { deduplicateById } from '@/src/lib/utils';

describe('utils: array', () => {
  describe('deduplicateById', () => {
    it('should remove duplicated', () => {
      const items = [{ id: 1 }, { id: 1 }, { id: 2 }];

      expect(deduplicateById(items)).toStrictEqual([{ id: 1 }, { id: 2 }]);
    });
  });
});
