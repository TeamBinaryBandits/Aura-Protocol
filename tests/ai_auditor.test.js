import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GeminiService } from '../src/services/gemini.js';

describe('Gemini AI Privacy Auditor Tests', () => {
  it('should flag potential PII leaks when explicit contact terms are present', async () => {
    const service = new GeminiService();
    const result = await service.auditSurveyPrivacy(
      "Enter your full name and email address",
      "We need your phone number",
      ["Option A", "Option B"],
      50
    );

    assert.ok(result.privacyScore < 80);
    assert.ok(result.recommendations.length > 0);
  });

  it('should grant high privacy score to k-anonymized zero-knowledge questions', async () => {
    const service = new GeminiService();
    const result = await service.auditSurveyPrivacy(
      "Midnight Network Protocol Grant Priorities",
      "Select developer tools to prioritize",
      ["Compact Debugger", "1AM Wallet DApp Connector"],
      75
    );

    assert.ok(result.privacyScore >= 80);
    assert.equal(result.riskLevel, 'LOW');
  });
});
