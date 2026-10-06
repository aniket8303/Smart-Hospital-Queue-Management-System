'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  ExternalLink, 
  Wifi, 
  Sparkles, 
  Settings2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { QRCodeCanvas } from './QRCodeCanvas';
import { 
  getMobileBaseUrl, 
  getMobileTokenUrl, 
  KNOWN_NETWORK_IPS, 
  setCustomLanIp, 
  getSavedLanIp 
} from '@/lib/network';

interface MobileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenNumber?: string;
  customAction?: 'get-token' | 'claim';
  title?: string;
  subtitle?: string;
}

export function MobileQrModal({
  isOpen,
  onClose,
  tokenNumber,
  customAction = 'get-token',
  title = 'Scan to Get Mobile Digital Token',
  subtitle = 'Point your smartphone camera at this QR code to join the queue and get your live token pass.',
}: MobileQrModalProps) {
  const [selectedIp, setSelectedIp] = useState<string>('10.20.4.229');
  const [copied, setCopied] = useState(false);
  const [showIpSettings, setShowIpSettings] = useState(false);
  const [customIpInput, setCustomIpInput] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = getSavedLanIp();
      setSelectedIp(saved);
      setCustomIpInput(saved);
      setQrUrl(getMobileTokenUrl(tokenNumber, customAction));
    }
  }, [isOpen, tokenNumber, customAction]);

  if (!isOpen) return null;

  const handleIpChange = (newIp: string) => {
    setSelectedIp(newIp);
    setCustomLanIp(newIp);
    setTimeout(() => {
      setQrUrl(getMobileTokenUrl(tokenNumber, customAction));
    }, 50);
  };

  const handleCopy = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main QR Display Card */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-inner text-center">
            <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-slate-100 dark:border-slate-800/80">
              {qrUrl ? (
                <QRCodeCanvas
                  value={qrUrl}
                  size={200}
                  fgColor="#020617"
                  bgColor="#ffffff"
                  className="rounded-2xl"
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse">
                  <span className="text-xs text-slate-400">Loading QR...</span>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Camera Scannable
              </span>
              <p className="text-xs text-slate-500 font-medium">
                {tokenNumber
                  ? `Scans directly to Token #${tokenNumber}`
                  : 'Scans directly to Mobile Instant Queue'}
              </p>
            </div>
          </div>

          {/* Quick Instructions */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 text-[10px] font-black flex items-center justify-center mx-auto">1</span>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Same Wi-Fi</span>
              <span className="text-[10px] text-slate-400 block leading-tight">Connect phone to Wi-Fi / Hotspot</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 text-[10px] font-black flex items-center justify-center mx-auto">2</span>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Scan Camera</span>
              <span className="text-[10px] text-slate-400 block leading-tight">Point camera at QR code</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 text-[10px] font-black flex items-center justify-center mx-auto">3</span>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Get Token</span>
              <span className="text-[10px] text-slate-400 block leading-tight">Receive live pass &amp; SMS alerts</span>
            </div>
          </div>

          {/* Network URL Preview & Action Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-cyan-500" />
                Target Mobile URL:
              </span>
              <button
                onClick={() => setShowIpSettings(!showIpSettings)}
                className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Settings2 className="w-3 h-3" />
                <span>{showIpSettings ? 'Hide Network IP' : 'Change Network IP'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={qrUrl}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={qrUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
                title="Test in browser"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test</span>
              </a>
            </div>

            {/* Network Settings Collapsible */}
            {showIpSettings && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                  Select Host IPv4 Address:
                </span>
                <div className="flex flex-wrap gap-2">
                  {KNOWN_NETWORK_IPS.map((net) => (
                    <button
                      key={net.ip}
                      onClick={() => handleIpChange(net.ip)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                        selectedIp === net.ip
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      {net.ip} ({net.label})
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Custom IP e.g. 192.168.1.15"
                    value={customIpInput}
                    onChange={(e) => setCustomIpInput(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                  />
                  <button
                    onClick={() => handleIpChange(customIpInput)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold"
                  >
                    Set IP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Zero App Installation Required
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
