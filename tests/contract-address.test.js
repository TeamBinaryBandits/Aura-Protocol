import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createContractReservation, normalizeNetwork } from '../api/contract-address.js';

describe('server-issued contract reservations', () => {
  it('only accepts supported Midnight networks', () => {
    assert.equal(normalizeNetwork('PREVIEW'), 'preview');
    assert.equal(normalizeNetwork('preprod'), 'preprod');
    assert.equal(normalizeNetwork('mainnet'), null);
  });

  it('creates unique, server-side reservation identifiers', () => {
    const first = createContractReservation('preview');
    const second = createContractReservation('preview');

    assert.match(first.deploymentReference, /^aura_deploy_preview_[a-f0-9]{24}$/);
    assert.match(first.reservationId, /^aura_[a-f0-9]{24}$/);
    assert.equal(first.status, 'RESERVED');
    assert.notEqual(first.deploymentReference, second.deploymentReference);
  });
});
