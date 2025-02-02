import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AnalysisDashboard from '../components/analysis_dashboard';
import { COLORS } from '../constants/colors';

const AnalysisPage = ({ reports, loading, error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: COLORS.darkNavy }}>
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center mb-8 px-5 py-2.5 rounded-full text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            style={{ 
              backgroundColor: COLORS.deepRed,
              boxShadow: '0 4px 14px 0 rgba(135, 35, 65, 0.3)'
            }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Incident Reports
          </button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8"
        >
          {/* Analysis Dashboard */}
          <AnalysisDashboard reports={reports} isVisible={true} loading={loading} error={error} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnalysisPage; 