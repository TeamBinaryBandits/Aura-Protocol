import React, { useState } from 'react';
import { Check, Copy, FileCode2, Globe, Plus, ShieldCheck } from 'lucide-react';
import { reserveContractAddress } from '../services/midnight';

export default function ContractExplorer() {
  const [network, setNetwork] = useState('preview');
  const [reservations, setReservations] = useState([]);
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const copy = async (value, id) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  const reserve = async () => {
    setIsReserving(true);
    setError(null);
    try {
      const reservation = await reserveContractAddress(network);
      setReservations((current) => [reservation, ...current]);
    } catch (reason) {
      setError(reason.message || 'Unable to reserve a contract address.');
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-mono">
            <FileCode2 className="w-3.5 h-3.5" />
            Deployment registry
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Contract reservations</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Reservations are created on the server and expire after 15 minutes. They are not a substitute for a confirmed Midnight contract address, which must come from a wallet-authorized deployment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="reservation-network">Network</label>
          <select
            id="reservation-network"
            value={network}
            onChange={(event) => setNetwork(event.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800"
          >
            <option value="preview">Preview</option>
            <option value="preprod">Preprod</option>
          </select>
          <button
            type="button"
            onClick={reserve}
            disabled={isReserving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isReserving ? 'Reserving…' : 'Reserve address'}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">{error}</p>}

      {reservations.length === 0 ? (
        <div className="p-10 rounded-3xl border border-dashed border-slate-300 bg-white/60 text-center">
          <Globe className="w-7 h-7 mx-auto text-slate-400" />
          <h2 className="mt-3 font-bold text-slate-800">No reservation yet</h2>
          <p className="mt-1 text-xs text-slate-600">Reserve a deployment reference here or begin a survey deployment. The browser never fabricates contract identifiers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <article key={reservation.reservationId} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h2 className="font-bold text-slate-900">{reservation.network} deployment reservation</h2>
                    <p className="text-xs text-slate-500">Expires {new Date(reservation.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-mono">{reservation.status}</span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between gap-2 text-slate-500">
                    Server-issued deployment reference
                    <button type="button" onClick={() => copy(reservation.deploymentReference, reservation.reservationId)} className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-800">
                      {copiedId === reservation.reservationId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy
                    </button>
                  </div>
                  <p className="mt-2 break-all font-semibold text-slate-900">{reservation.deploymentReference}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500">Reservation ID</p>
                  <p className="mt-2 break-all font-semibold text-slate-900">{reservation.reservationId}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
