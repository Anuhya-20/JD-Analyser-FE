import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Dashboard } from '@/pages/Dashboard';
import { JobDescription } from '@/pages/JobDescription';
import { CandidateUpload } from '@/pages/CandidateUpload';
import { AIProcessing } from '@/pages/AIProcessing';
import { MatchResults } from '@/pages/MatchResults';
import { CandidateProfile } from '@/pages/CandidateProfile';
import { SkillGapHeatmap } from '@/pages/SkillGapHeatmap';
import { CandidateComparison } from '@/pages/CandidateComparison';
import { InterviewQuestions } from '@/pages/InterviewQuestions';
import { HiringDecisionRoom } from '@/pages/HiringDecisionRoom';
import { Analytics } from '@/pages/Analytics';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { JobDescriptionDetail } from '@/pages/JobDescriptionDetail';

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.18 }}
  >
    {children}
  </motion.div>
);

function isAuthenticated() {
  return localStorage.getItem('talentiq_auth') === 'true';
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Always show login first — redirect / to /login if not authed */}
        <Route
          path="/"
          element={
            isAuthenticated()
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="jobs" element={<PageWrapper><JobDescription /></PageWrapper>} />
          <Route path="jobs/:id" element={<PageWrapper><JobDescriptionDetail /></PageWrapper>} />
          <Route path="candidates" element={<PageWrapper><CandidateUpload /></PageWrapper>} />
          <Route path="candidates/:id" element={<PageWrapper><CandidateProfile /></PageWrapper>} />
          <Route path="ai-processing" element={<PageWrapper><AIProcessing /></PageWrapper>} />
          <Route path="rankings" element={<PageWrapper><MatchResults /></PageWrapper>} />
          <Route path="heatmap" element={<PageWrapper><SkillGapHeatmap /></PageWrapper>} />
          <Route path="comparison" element={<PageWrapper><CandidateComparison /></PageWrapper>} />
          <Route path="interview" element={<PageWrapper><InterviewQuestions /></PageWrapper>} />
          <Route path="hiring-room" element={<PageWrapper><HiringDecisionRoom /></PageWrapper>} />
          <Route path="reports" element={<PageWrapper><Analytics /></PageWrapper>} />
          <Route path="report" element={<PageWrapper><Reports /></PageWrapper>} />
          <Route path="settings" element={<PageWrapper><Settings /></PageWrapper>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
