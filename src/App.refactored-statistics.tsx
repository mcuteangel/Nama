import React from 'react';
import Statistics from './pages/Statistics';
import ContactStatisticsDashboard from './components/ContactStatisticsDashboard';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-8">
        {/* Refactored Statistics Page */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            صفحه آمار بازطراحی شده
          </h2>
          <Statistics />
        </div>

        {/* Separator */}
        <div className="border-t border-border my-8"></div>

        {/* Enhanced Dashboard Component */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            داشبورد آمار بهبود یافته
          </h2>
          <ContactStatisticsDashboard />
        </div>
      </div>
    </div>
  );
}

export default App;