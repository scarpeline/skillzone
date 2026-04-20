import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Games from "./pages/Games";
import GamePlay from "./pages/GamePlay";
import Tournaments from "./pages/Tournaments";
import Rankings from "./pages/Rankings";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import HallOfFame from "./pages/HallOfFame";
import Affiliates from "./pages/Affiliates";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Records from "./pages/Records";
import NotFound from "./pages/NotFound";
import Missions from "./pages/Missions";
import VipDashboard from "./pages/VipDashboard";
import NotificationSettings from "./pages/NotificationSettings";
import AdminDashboard from "./pages/AdminDashboard";
import Onboarding from "./pages/Onboarding";
import Campaigns from "./pages/Campaigns";
import Sports from "./pages/Sports";
import TournamentLobby from "./pages/TournamentLobby";
import { LiveChat } from "./components/LiveChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:gameId" element={<Games />} />
            <Route path="/games/:gameId/play" element={<GamePlay />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:tournamentId" element={<TournamentLobby />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/player/:username" element={<Profile />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/affiliates" element={<Affiliates />} />
            <Route path="/records" element={<Records />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/vip" element={<VipDashboard />} />
            <Route path="/notifications" element={<NotificationSettings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <LiveChat />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
