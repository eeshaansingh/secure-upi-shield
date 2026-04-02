import { useState } from 'react';
import Header from '@/components/Header';
import HomeScreen from '@/components/HomeScreen';
import SimulationScreen from '@/components/SimulationScreen';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');

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
