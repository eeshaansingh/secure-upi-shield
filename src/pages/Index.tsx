import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import Header from '@/components/Header';
import HomeScreen from '@/components/HomeScreen';
import SimulationScreen from '@/components/SimulationScreen';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const [entered, setEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  if (!entered) {
    return <LandingPage onEnter={() => setEntered(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'home' && <HomeScreen onStartSimulation={() => setActiveTab('simulation')} />}
      {activeTab === 'simulation' && <SimulationScreen />}
      {activeTab === 'dashboard' && <AdminDashboard />}
    </div>
  );
};

export default Index;