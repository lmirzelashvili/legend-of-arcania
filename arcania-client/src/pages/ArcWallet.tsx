import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { arcApi } from '@/services/api';
import type { ArcWalletInfo, ArcTransactionRow } from '@/services/api';

function rawToDisplay(raw: string, decimals: number): string {
  if (!raw) return '0';
  const neg = raw.startsWith('-');
  const s = neg ? raw.slice(1) : raw;
  const padded = s.padStart(decimals + 1, '0');
  const whole = padded.slice(0, padded.length - decimals);
  const frac = padded.slice(padded.length - decimals).replace(/0+$/, '');
  return (neg ? '-' : '') + (frac ? `${whole}.${frac}` : whole);
}

function displayToRaw(input: string, decimals: number): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const [whole, frac = ''] = trimmed.split('.');
  if (frac.length > decimals) return null;
  const paddedFrac = (frac + '0'.repeat(decimals)).slice(0, decimals);
  const raw = (BigInt(whole) * 10n ** BigInt(decimals) + BigInt(paddedFrac || '0')).toString();
  return raw;
}

const shortSig = (s: string | null) => (s ? `${s.slice(0, 8)}…${s.slice(-6)}` : '—');

const ArcWallet: React.FC = () => {
  const [wallet, setWallet] = useState<ArcWalletInfo | null>(null);
  const [txs, setTxs] = useState<ArcTransactionRow[]>([]);
  const [checking, setChecking] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [w, t] = await Promise.all([arcApi.getWallet(), arcApi.getTransactions(20)]);
      setWallet(w.data);
      setTxs(t.data.transactions);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 15_000);
    return () => clearInterval(id);
  }, [refresh]);

  const onCheckDeposits = async () => {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      const r = await arcApi.checkDeposits();
      if (r.data.swept) {
        setMessage(`Swept ${rawToDisplay(r.data.amount, wallet?.decimals ?? 9)} ARC (sig ${shortSig(r.data.signature ?? '')})`);
      } else {
        setMessage(r.data.reason === 'no_balance' ? 'No deposit found yet.' : `Check returned: ${r.data.reason ?? 'no change'}`);
      }
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  };

  const onWithdraw = async () => {
    setError(null);
    setMessage(null);
    if (!wallet) return;
    const raw = displayToRaw(amountInput, wallet.decimals);
    if (!raw) {
      setError('Invalid amount.');
      return;
    }
    setWithdrawing(true);
    try {
      const r = await arcApi.withdraw(raw, destinationInput.trim() || undefined);
      setMessage(`Withdraw confirmed. Signature: ${shortSig(r.data.signature ?? '')}`);
      setAmountInput('');
      await refresh();
    } catch (e) {
      const err = e as { response?: { data?: { error?: string; message?: string } }; message: string };
      setError(err.response?.data?.message ?? err.response?.data?.error ?? err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  const decimals = wallet?.decimals ?? 9;
  const balanceDisplay = wallet ? rawToDisplay(wallet.balance, decimals) : '—';
  const capDisplay = wallet ? rawToDisplay(wallet.hotWalletCap, decimals) : '—';
  const minDisplay = wallet ? rawToDisplay(wallet.minWithdraw, decimals) : '—';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 text-gray-200">
        <h1 className="text-2xl text-amber-400 mb-1">ARC Wallet</h1>
        <p className="text-xs text-gray-500 mb-6">
          Deposit ARC into a unique per-account address, or withdraw your in-game balance to your Solana wallet.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-800 bg-black p-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">In-game balance</div>
            <div className="text-2xl text-amber-400">{balanceDisplay} ARC</div>
            <div className="text-[10px] text-gray-600 mt-2">
              Mint: <span className="text-gray-400">{wallet?.mint.slice(0, 12) ?? '—'}…</span>
              {' · '}cluster: <span className="text-gray-400">{wallet?.cluster ?? '—'}</span>
            </div>
          </div>
          <div className="border border-gray-800 bg-black p-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Your deposit address</div>
            <div className="font-mono text-xs break-all text-gray-300">{wallet?.depositAddress ?? '—'}</div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => wallet && navigator.clipboard.writeText(wallet.depositAddress)}
                className="text-[10px] px-2 py-1 bg-gray-900 border border-gray-700 hover:bg-gray-800"
              >Copy</button>
              <button
                onClick={onCheckDeposits}
                disabled={checking}
                className="text-[10px] px-2 py-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-50"
              >{checking ? 'Checking…' : 'I sent ARC — check now'}</button>
            </div>
          </div>
        </div>

        <div className="border border-gray-800 bg-black p-4 mb-6">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Withdraw</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder={`Amount (min ${minDisplay} ARC)`}
              className="bg-gray-950 border border-gray-700 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="Destination wallet (leave blank to use linked)"
              className="bg-gray-950 border border-gray-700 px-3 py-2 text-sm md:col-span-2"
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="text-[10px] text-gray-600">
              Per-withdrawal cap: {capDisplay} ARC
            </div>
            <button
              onClick={onWithdraw}
              disabled={withdrawing}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-sm"
            >{withdrawing ? 'Sending…' : 'Withdraw'}</button>
          </div>
        </div>

        {message && (
          <div className="border border-amber-800 bg-amber-950/40 text-amber-200 text-xs p-3 mb-4">
            {message}
          </div>
        )}
        {error && (
          <div className="border border-red-800 bg-red-950/40 text-red-200 text-xs p-3 mb-4">
            {error}
          </div>
        )}

        <h2 className="text-lg text-amber-400 mb-3">Recent activity</h2>
        <div className="border border-gray-800 bg-black">
          <table className="w-full text-xs">
            <thead className="text-gray-500 border-b border-gray-800">
              <tr>
                <th className="text-left p-2">When</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Status</th>
                <th className="text-right p-2">Amount</th>
                <th className="text-left p-2">Tx</th>
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 && (
                <tr><td colSpan={5} className="p-3 text-center text-gray-600">No activity yet.</td></tr>
              )}
              {txs.map((t) => (
                <tr key={t.id} className="border-b border-gray-900 last:border-0">
                  <td className="p-2 text-gray-500">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="p-2">{t.type}</td>
                  <td className="p-2">
                    <span className={
                      t.status === 'CONFIRMED' ? 'text-green-400'
                      : t.status === 'FAILED' ? 'text-red-400'
                      : 'text-amber-400'
                    }>{t.status}</span>
                  </td>
                  <td className="p-2 text-right text-amber-400">{rawToDisplay(t.amount, decimals)}</td>
                  <td className="p-2 font-mono text-gray-500">
                    {t.signature ? (
                      <a
                        href={`https://solscan.io/tx/${t.signature}?cluster=${wallet?.cluster ?? 'devnet'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-amber-400"
                      >{shortSig(t.signature)}</a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default ArcWallet;
