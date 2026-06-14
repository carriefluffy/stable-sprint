
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './config/wagmi';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import { WalletStatus } from './components/WalletStatus';
import { TemporalBackground } from './components/TemporalBackground';
const queryClient = new QueryClient();

const LogoSVG = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]">
    <rect x="2" y="2" width="16" height="16" rx="3" fill="#120b1a" stroke="var(--color-primary)" strokeWidth="1.5"/>
    <rect x="6" y="5" width="8" height="6" rx="1" fill="var(--color-primary)" opacity="0.9"/>
    <rect x="9" y="13" width="2" height="3" rx="0.5" fill="var(--color-primary)" opacity="0.6"/>
    <circle cx="7" cy="15" r="1" fill="#FCFF52"/>
    <circle cx="13" cy="15" r="1" fill="#F72585"/>
  </svg>
);

const NavIcon: React.FC<{ icon: string, label: string, to: string, active: boolean }> = ({ icon, label, to, active }) => (
  <Link to={to} className={`flex flex-col items-center gap-1 flex-1 py-2.5 transition-all relative ${active ? 'text-primary scale-105' : 'text-white/40 hover:text-white/70'}`}>
    <span className="text-xl drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">{icon}</span>
    <span className="font-mono text-[10px] font-bold tracking-wider uppercase">{label}</span>
    {active && (
      <span className="absolute bottom-0.5 w-6 h-0.5 bg-primary rounded-full shadow-[0_0_6px_var(--color-primary)]" />
    )}
  </Link>
);

const BottomNav: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 flex justify-around px-2 pb-safe">
      <NavIcon icon="🎮" label="Games" to="/" active={location.pathname === '/'} />
      <NavIcon icon="📊" label="Scores" to="/leaderboard" active={location.pathname === '/leaderboard'} />
      <NavIcon icon="👤" label="Profile" to="/profile" active={location.pathname === '/profile'} />
    </nav>
  );
};

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen relative flex flex-col pb-20">
            <TemporalBackground />
            
            {/* Tech Status Bar */}
            <header className="w-full px-6 py-4 flex items-center justify-between sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-xl">
              <Link to="/" className="flex items-center gap-2.5">
                <LogoSVG />
                <span className="font-arcade text-xs tracking-widest text-primary text-glow-primary">
                  CELO ATARI
                </span>
              </Link>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-6 mr-4">
                  <span className="tech-label opacity-40">System: <span className="text-success text-glow-success font-bold">Operational</span></span>
                  <span className="tech-label opacity-40">Network: <span className="text-secondary text-glow-primary">Mainnet</span></span>
                </div>
                <WalletStatus />
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto relative px-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/play/:gameId" element={<Play />} />
                <Route path="/play" element={<Play />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>

            <BottomNav />
          </div>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;

