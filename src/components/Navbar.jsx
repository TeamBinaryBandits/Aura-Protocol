import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Wallet, 
  Volume2, 
  VolumeX, 
  User, 
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { midnightService, NETWORKS } from '../services/midnight';
import { calmingAudio } from '../services/audio';

export default function Navbar() {
  const location = useLocation();
  const [walletState, setWalletState] = useState({
    isConnected: false,
    walletAddress: null,
    network: NETWORKS.PREVIEW,
    dustBalance: 0,
    nightBalance: 0,
    walletType: null
  });

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const unsubscribe = midnightService.subscribe(setWalletState);
    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    const result = await midnightService.connectWallet();
    if (!result.success) setConnectionError(result.error);
    setIsConnecting(false);
  };

  const toggleAudio = () => {
    const playing = calmingAudio.toggle();
    setIsAudioPlaying(playing);
  };

  const switchNetwork = (netKey) => {
    midnightService.setNetwork(netKey);
    setIsNetworkMenuOpen(false);
  };

  const truncate = (str) => {
    if (!str) return '';
    return str.substring(0, 6) + '...' + str.substring(str.length - 4);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-[1px] shadow-sm group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-emerald-50 rounded-[15px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-800">
                AURA
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                オーラ
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 font-sans hidden sm:block">
              Private surveys · Midnight ZK
            </p>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-emerald-50/80 p-1.5 rounded-2xl border border-emerald-200/80">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              location.pathname === '/'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            Garden (Dashboard)
          </Link>
          
          <Link
            to="/create"
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              location.pathname === '/create'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            New Survey
          </Link>

          <Link
            to="/contracts"
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              location.pathname === '/contracts'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            Contracts & Hashes
          </Link>

          <Link
            to="/credentials"
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              location.pathname === '/credentials'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            ZK Badges
          </Link>

          <Link
            to="/explorer"
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              location.pathname === '/explorer'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            Compact Circuit
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Zen Audio Toggle */}
          <button
            onClick={toggleAudio}
            title={isAudioPlaying ? "Mute Zen Soundscape" : "Play Ghibli Zen Soundscape"}
            className={`p-2.5 rounded-xl border transition-all ${
              isAudioPlaying
                ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-sm animate-pulse'
                : 'bg-emerald-50 border-emerald-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Network Selector */}
          <div className="relative">
            <button
              onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-800 text-xs font-mono font-medium hover:border-emerald-400 transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${
                walletState.network.id === 'preview' ? 'bg-sky-500' : 'bg-purple-500'
              }`} />
              <span className="capitalize hidden sm:inline">{walletState.network.id}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isNetworkMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-emerald-200 shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-emerald-800 font-semibold border-b border-emerald-100 mb-1">
                  Midnight Network
                </div>
                <button
                  onClick={() => switchNetwork('preview')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                    walletState.network.id === 'preview'
                      ? 'bg-emerald-100 text-emerald-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>Preview Testnet</span>
                  </div>
                  {walletState.network.id === 'preview' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                </button>

                <button
                  onClick={() => switchNetwork('preprod')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all mt-1 ${
                    walletState.network.id === 'preprod'
                      ? 'bg-purple-100 text-purple-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Preprod Testnet</span>
                  </div>
                  {walletState.network.id === 'preprod' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />}
                </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <Link
            to="/profile"
            className={`p-2.5 rounded-xl border transition-all ${
              location.pathname === '/profile'
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-50 border-emerald-200 text-slate-700 hover:text-slate-900'
            }`}
            title="User Profile"
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Wallet Button */}
          {walletState.isConnected ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 bg-emerald-100 border border-emerald-300 rounded-2xl px-3 py-1.5 hover:bg-emerald-200 transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-mono text-emerald-950 font-semibold">
                {truncate(walletState.walletAddress)}
              </span>
            </Link>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Connect 1AM Wallet'}</span>
              <span className="sm:hidden">Connect</span>
            </button>
          )}

        </div>
      </div>
      {connectionError && (
        <div role="alert" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 text-xs text-rose-800">
          {connectionError}
        </div>
      )}
    </header>
  );
}
