import React, { useState } from 'react';
import { Cpu, ShieldCheck, Lock, EyeOff, Code, Play, CheckCircle2, Layers, Sparkles } from 'lucide-react';
import { AnonymousSurveyContract } from '../../managed/anonymous_survey';

export default function ZKCircuitExplorer() {
  const [contractInstance] = useState(() => new AnonymousSurveyContract());
  const [testOutput, setTestOutput] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const runCircuitSimulation = async () => {
    setIsExecuting(true);
    await new Promise(res => setTimeout(res, 600));

    try {
      const res = await contractInstance.cast_anonymous_vote({
        secret_voter_key: '0xsk_secret_voter_demo_key_99',
        selected_option: 0,
        eligibility_score: 90
      });

      setTestOutput({
        success: true,
        circuit: 'cast_anonymous_vote',
        nullifier: res.nullifier,
        proofHash: res.proof_hash,
        updatedState: contractInstance.state
      });
    } catch (err) {
      setTestOutput({
        success: false,
        error: err.message
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Compact Smart Contract Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Compact Zero-Knowledge Circuit Explorer
        </h1>
        <p className="text-sm text-slate-600">
          Inspect how AURA structures off-chain private <code className="text-indigo-300 font-mono">witness</code> execution, on-chain <code className="text-cyan-300 font-mono">export ledger</code> state, and explicit <code className="text-emerald-300 font-mono">disclose()</code> bounds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Compact Code Viewer (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-4 p-6 rounded-3xl bg-midnight-950/90 border border-slate-800/80 backdrop-blur-md shadow-glass">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-indigo-300 font-bold flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span>contracts/anonymous_survey.compact</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Compact 0.14+
            </span>
          </div>

          <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-2xl bg-slate-900/80 border border-slate-800 leading-relaxed max-h-[480px] overflow-y-auto">
{`// AURA - Anonymous Feedback & Survey Protocol
// Written in Compact for Midnight Network

export ledger poll_id: Counter;
export ledger poll_title_hash: Cell<Bytes<32>>;
export ledger total_ballots_cast: Counter;
export ledger option_a_votes: Counter;
export ledger option_b_votes: Counter;

// Private Witness (Evaluated locally off-chain via 1AM Wallet)
witness secret_voter_key(): Bytes<32>;
witness selected_option(): Uint<8>;
witness eligibility_score(): Uint<32>;

// Circuit 2: Cast zero-knowledge anonymous vote
export circuit cast_anonymous_vote(): Void {
  const score = eligibility_score();
  const req_threshold = min_eligibility_threshold.read();
  
  // ZK Assertion Gate
  assert score >= req_threshold "Score below threshold";
  
  const sk = secret_voter_key();
  const nullifier = persistent_hash<Bytes<32>>(sk);
  
  const opt = selected_option();
  
  // Increment public ledger tally counter based on private choice
  if (opt == 0) {
    option_a_votes.increment(1);
  } else {
    option_b_votes.increment(1);
  }
  
  total_ballots_cast.increment(1);
}

// Explicit disclosure helper
export circuit get_public_summary(): Bytes<32> {
  const hash_val = poll_title_hash.read();
  return disclose(hash_val);
}`}
          </pre>
        </div>

        {/* Interactive Circuit Execution Playground (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-midnight-900/80 border border-indigo-500/30 backdrop-blur-md shadow-glass space-y-4">
            
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400" />
                <span>Circuit Execution Simulator</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">1AM Wallet Prover</span>
            </div>

            <p className="text-xs text-slate-300">
              Run local witness evaluation and test zero-knowledge circuit assertions.
            </p>

            <button
              onClick={runCircuitSimulation}
              disabled={isExecuting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-indigo transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Proving ZK Circuit...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Simulate cast_anonymous_vote()</span>
                </>
              )}
            </button>

            {testOutput && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Proof Generated</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Circuit Passed</span>
                </div>

                <div className="space-y-1 text-slate-300 text-[11px] pt-1 border-t border-slate-800/80">
                  <div>Nullifier: <span className="text-indigo-300">{testOutput.nullifier}</span></div>
                  <div>Proof Hash: <span className="text-cyan-300">{testOutput.proofHash}</span></div>
                  <div>Option A Votes: <span className="text-emerald-400 font-bold">{testOutput.updatedState.option_a_votes}</span></div>
                  <div>Total Ballots: <span className="text-white font-bold">{testOutput.updatedState.total_ballots_cast}</span></div>
                </div>
              </div>
            )}

          </div>

          <div className="p-6 rounded-3xl bg-midnight-900/80 border border-slate-800/80 backdrop-blur-md shadow-glass space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 font-bold">
              Key Compact Language Rules
            </h3>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Witness isolation</strong>: Private callbacks execute on user's device inside 1AM Wallet.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>disclose() bounds</strong>: Compiler rejects unannotated witness output going to public ledger.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
