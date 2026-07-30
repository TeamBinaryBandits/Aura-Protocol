import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GhibliCanvas2D from './components/GhibliCanvas2D';
import Home from './pages/Home';
import CreateSurvey from './pages/CreateSurvey';
import CastVote from './pages/CastVote';
import SurveyDetails from './pages/SurveyDetails';
import ZKCircuitExplorer from './pages/ZKCircuitExplorer';
import NetworkSettings from './pages/NetworkSettings';
import Profile from './pages/Profile';
import ContractExplorer from './pages/ContractExplorer';
import Credentials from './pages/Credentials';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen text-slate-800 font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
        {/* Calming Ghibli 2D Canvas Background with Sakura Petals & Floating Lanterns */}
        <GhibliCanvas2D />

        {/* Japanese Ghibli Styled Top Navbar */}
        <Navbar />

        {/* Main Content Container */}
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateSurvey />} />
            <Route path="/vote/:id" element={<CastVote />} />
            <Route path="/survey/:id" element={<SurveyDetails />} />
            <Route path="/explorer" element={<ZKCircuitExplorer />} />
            <Route path="/settings" element={<NetworkSettings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contracts" element={<ContractExplorer />} />
            <Route path="/credentials" element={<Credentials />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-emerald-900/40 bg-midnight-950/90 backdrop-blur-md py-6 text-center text-xs font-mono text-emerald-300/80">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AURA Protocol · Midnight Preview & Preprod</span>
            </div>
            <div className="flex items-center gap-4 text-emerald-400/70">
              <a href="https://midnight.network" target="_blank" rel="noopener noreferrer" className="hover:text-amber-200 transition-colors">
                Midnight Docs
              </a>
              <a href="https://1am.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-200 transition-colors">
                1AM Wallet
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
