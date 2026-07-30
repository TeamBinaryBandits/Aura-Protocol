import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createActivityReference } from '../api/activity-reference.js';

describe('server-issued demo activity references', () => {
  it('never creates an identifier that can be mistaken for a transaction hash', () => {
    const first = createActivityReference('preview', 'cast_anonymous_vote');
    const second = createActivityReference('preview', 'cast_anonymous_vote');

    assert.match(first.activityReference, /^aura_demo_preview_[a-f0-9]{32}$/);
    assert.equal(first.status, 'DEMO');
    assert.equal(first.action, 'cast_anonymous_vote');
    assert.notEqual(first.activityReference, second.activityReference);
  });

  it('rejects unsupported networks and actions', () => {
    assert.throws(() => createActivityReference('mainnet', 'cast_anonymous_vote'), /Unsupported Midnight network/);
    assert.throws(() => createActivityReference('preview', 'transfer'), /Unsupported demo activity/);
  });
});
