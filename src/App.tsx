/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, MouseEvent } from "react";
import { 
  Briefcase, 
  ChevronRight, 
  Coins, 
  Cpu, 
  DollarSign, 
  Home, 
  Lock, 
  MousePointer2, 
  Rocket, 
  Store, 
  TrendingUp, 
  Zap,
  User,
  Trophy,
  CreditCard,
  Gamepad2
} from "lucide-react";
import { Business, GameState } from "./types";

const INITIAL_BUSINESSES: Business[] = [
  { id: "tea-stall", name: "Chai Tapri", baseCost: 10, baseRevenue: 0.5, description: "Small tea stall with high demand.", icon: "Store", owned: 0, locked: false },
  { id: "delivery", name: "Delivery Boy", baseCost: 50, baseRevenue: 2, description: "Delivering happiness door to door.", icon: "ChevronRight", owned: 0, locked: false },
  { id: "freelancer", name: "Freelance Dev", baseCost: 200, baseRevenue: 8, description: "Coding in coffee shops.", icon: "Cpu", owned: 0, locked: true },
  { id: "agency", name: "Marketing Agency", baseCost: 1000, baseRevenue: 40, description: "Dominating the digital ad space.", icon: "Briefcase", owned: 0, locked: true },
  { id: "startup", name: "Tech Startup", baseCost: 5000, baseRevenue: 200, description: "The next unicorn in the making.", icon: "Zap", owned: 0, locked: true },
  { id: "bank", name: "Global Bank", baseCost: 25000, baseRevenue: 1000, description: "Where the big money flows.", icon: "DollarSign", owned: 0, locked: true },
  { id: "real-estate", name: "Real Estate Empire", baseCost: 100000, baseRevenue: 5000, description: "Buying the whole city, brick by brick.", icon: "Home", owned: 0, locked: true },
  { id: "space", name: "Mars Mining", baseCost: 1000000, baseRevenue: 60000, description: "Mining resources from the red planet.", icon: "Rocket", owned: 0, locked: true },
];

const SAVED_GAME_KEY = "paisa_tycoon_3_save";

const WINNERS = [
  { name: "Rahul K.", amount: 500 },
  { name: "Priya M.", amount: 1200 },
  { name: "Sanjay J.", amount: 50 },
  { name: "Neha S.", amount: 2000 },
  { name: "Vikram V.", amount: 150 },
  { name: "Amit G.", amount: 300 },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVED_GAME_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, lastUpdate: Date.now() };
    }
    return {
      balance: 0,
      lifetimeEarnings: 0,
      clickValue: 1,
      businesses: INITIAL_BUSINESSES,
      lastUpdate: Date.now(),
    };
  });

  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; val: string }[]>([]);
  const lastTickRef = useRef<number>(Date.now());
  const requestRef = useRef<number>(null);

  // Calculate total income per second
  const incomePerSecond = gameState.businesses.reduce((acc, b) => acc + (b.owned * b.baseRevenue), 0);

  // Game Loop
  const animate = (time: number) => {
    const now = Date.now();
    const deltaTime = (now - lastTickRef.current) / 1000;
    
    if (deltaTime >= 0.1) { // Tick every 100ms
      setGameState(prev => {
        const earned = incomePerSecond * deltaTime;
        const newBalance = prev.balance + earned;
        const newLifetime = prev.lifetimeEarnings + earned;
        
        // Unlock businesses
        const updatedBusinesses = prev.businesses.map(b => {
          if (b.locked && newLifetime >= b.baseCost * 0.5) {
            return { ...b, locked: false };
          }
          return b;
        });

        return {
          ...prev,
          balance: newBalance,
          lifetimeEarnings: newLifetime,
          businesses: updatedBusinesses,
          lastUpdate: now,
        };
      });
      lastTickRef.current = now;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [incomePerSecond]);

  // Persist game state
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(gameState));
    }, 5000);
    return () => clearInterval(interval);
  }, [gameState]);

  const handleManualClick = (e: MouseEvent) => {
    const val = gameState.clickValue;
    setGameState(prev => ({
      ...prev,
      balance: prev.balance + val,
      lifetimeEarnings: prev.lifetimeEarnings + val,
    }));

    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, x: e.clientX, y: e.clientY, val: `+₹${val.toFixed(0)}` }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  const buyBusiness = (businessId: string) => {
    setGameState(prev => {
      const idx = prev.businesses.findIndex(b => b.id === businessId);
      const business = prev.businesses[idx];
      const cost = Math.floor(business.baseCost * Math.pow(1.15, business.owned));

      if (prev.balance >= cost) {
        const newBusinesses = [...prev.businesses];
        newBusinesses[idx] = { ...business, owned: business.owned + 1 };
        return {
          ...prev,
          balance: prev.balance - cost,
          businesses: newBusinesses,
        };
      }
      return prev;
    });
  };

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `₹${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(2)}`;
  };

  const getBusinessStyle = (index: number) => {
    const styles = ['card-pink', 'card-gold', 'card-blue', 'card-cyan'];
    return styles[index % styles.length];
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Store, ChevronRight, Cpu, Briefcase, Zap, DollarSign, Home, Rocket
    };
    const IconBtn = icons[iconName] || Coins;
    return <IconBtn size={24} />;
  };

  return (
    <div className="flex flex-col h-screen bg-brand-dark overflow-hidden select-none">
      {/* Header - Styled like Theme Header */}
      <header className="h-[100px] paisa-gradient flex items-center justify-between px-10 shadow-xl z-20">
        <div className="flex items-center gap-4">
          <div className="w-[50px] h-[50px] bg-brand-accent rounded-full border-3 border-white shadow-lg flex items-center justify-center text-brand-dark">
            <User size={30} />
          </div>
          <div className="text-white">
            <div className="text-sm opacity-80">Welcome back,</div>
            <div className="text-xl font-bold tracking-tight leading-tight">Tycoon Player</div>
          </div>
        </div>

        <div className="wallet-pill px-6 py-2.5 rounded-full flex items-center gap-2 ring-1 ring-white/20">
          <span className="text-white opacity-80 font-medium">💰 Total:</span>
          <span className="text-2xl font-black">{formatMoney(gameState.balance)}</span>
        </div>

        <button className="badge-red px-5 py-2.5 rounded-xl font-black text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-lg">
          WITHDRAW
        </button>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 p-8 overflow-hidden">
        
        {/* Play Area & Assets */}
        <div className="overflow-y-auto space-y-8 pr-2 custom-scrollbar">
          
          {/* Hero Interaction */}
          <section 
            onClick={handleManualClick}
            className="card-pink p-8 rounded-3xl relative overflow-hidden cursor-pointer group shadow-2xl transition-transform active:scale-[0.98]"
          >
            <div className="absolute top-4 right-4 badge-red text-white py-1 px-3 rounded-full text-xs font-black shadow-lg animate-pulse">
              LIVE NOW
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-4xl font-black uppercase tracking-tight leading-none mb-2">Tap & Win</h3>
                <p className="opacity-90 font-medium italic">Current Tap Value: ₹{gameState.clickValue}</p>
                <button className="btn-white mt-6 px-6 py-2.5 rounded-xl font-black text-lg transition-all group-hover:scale-105">
                  CLICK NOW
                </button>
              </div>
              <MousePointer2 size={80} className="opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform" />
            </div>
          </section>

          {/* Business Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gameState.businesses.map((business, idx) => {
              const cost = Math.floor(business.baseCost * Math.pow(1.15, business.owned));
              const canAfford = gameState.balance >= cost;
              const cardStyle = getBusinessStyle(idx);

              if (business.locked) {
                return (
                  <div key={business.id} className="bg-black/20 p-6 rounded-3xl border border-white/10 flex items-center gap-4 grayscale opacity-40">
                    <Lock size={30} className="text-white/30" />
                    <div>
                      <p className="font-black text-lg uppercase tracking-tight">Locked Asset</p>
                      <p className="text-xs opacity-60">Unlock at {formatMoney(business.baseCost * 0.5)} earnings</p>
                    </div>
                  </div>
                );
              }

              return (
                <motion.div 
                  layout
                  key={business.id}
                  className={`${cardStyle} p-6 rounded-3xl relative flex flex-col justify-between shadow-lg border-2 border-white/10 transition-all ${!canAfford && 'opacity-70 saturate-50'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{business.name}</h3>
                      <p className="text-xs font-mono opacity-80 mt-1 uppercase tracking-widest leading-none">LVL {business.owned}</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      {getIcon(business.icon)}
                    </div>
                  </div>
                  
                  <p className="text-sm opacity-90 mb-6 italic line-clamp-2">₹{business.baseRevenue}/sec Each</p>

                  <button 
                    onClick={(e) => { e.stopPropagation(); buyBusiness(business.id); }}
                    disabled={!canAfford}
                    className={`btn-white w-full py-3 rounded-xl font-black text-lg transition-all ${
                      canAfford ? 'hover:scale-105 cursor-pointer shadow-lg' : 'opacity-30 cursor-not-allowed'
                    }`}
                  >
                    UPGRADE: {formatMoney(cost)}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Feed */}
        <aside className="bg-black/20 rounded-3xl p-6 flex flex-col gap-4 border border-white/5 overflow-hidden">
          <h4 className="text-brand-accent text-lg font-black uppercase tracking-widest border-b border-white/10 pb-4 flex items-center gap-2">
            <Trophy size={18} /> Live Winners
          </h4>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {WINNERS.map((winner, idx) => (
              <div key={idx} className="winner-row flex justify-between items-center p-3 rounded-xl border border-white/5">
                <span className="font-bold text-sm tracking-tight">{winner.name}</span>
                <span className="text-green-400 font-black">+₹{winner.amount}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto bg-brand-accent/10 p-5 rounded-2xl border-2 border-dashed border-brand-accent text-center">
            <div className="text-brand-accent font-black uppercase">Daily Bonus</div>
            <div className="text-xs opacity-80 mt-1">Claim ₹{incomePerSecond > 0 ? formatMoney(incomePerSecond * 60) : '20'} today</div>
          </div>
        </aside>
      </main>

      {/* Footer Nav */}
      <nav className="h-[80px] bg-brand-deep flex justify-center items-center gap-12 border-t-2 border-white/5 z-20">
        <div className="nav-item text-brand-accent flex flex-col items-center cursor-pointer transition-opacity">
          <Home size={24} />
          <span className="text-[10px] font-black uppercase mt-1">Home</span>
        </div>
        <div className="nav-item opacity-40 flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
          <Gamepad2 size={24} />
          <span className="text-[10px] font-black uppercase mt-1">Games</span>
        </div>
        <div className="nav-item opacity-40 flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
          <Trophy size={24} />
          <span className="text-[10px] font-black uppercase mt-1">Leaders</span>
        </div>
        <div className="nav-item opacity-40 flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
          <CreditCard size={24} />
          <span className="text-[10px] font-black uppercase mt-1">Wallet</span>
        </div>
        <div className="nav-item opacity-40 flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
          <User size={24} />
          <span className="text-[10px] font-black uppercase mt-1">Profile</span>
        </div>
      </nav>

      {/* Floating Click Texts */}
      <AnimatePresence>
        {floatingTexts.map(text => (
          <motion.div
            key={text.id}
            initial={{ opacity: 1, y: text.y - 20, x: text.x }}
            animate={{ opacity: 0, y: text.y - 120 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none text-brand-accent font-black z-50 text-2xl drop-shadow-lg"
            style={{ left: 0, top: 0 }}
          >
            {text.val}
          </motion.div>
        ))}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

