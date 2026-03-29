/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TechnicalLibraryPage } from './pages/TechnicalLibraryPage';
import { B2BMarketplacePage } from './pages/B2BMarketplacePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen font-body text-slate-900">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
            <Route path="/library" element={<TechnicalLibraryPage />} />
            <Route path="/market" element={<B2BMarketplacePage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/connection" element={<B2BMarketplacePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

