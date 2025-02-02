import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MapPin, Link as LinkIcon, CheckCircle, AlertTriangle, DollarSign, Heart, Lock, ChartBar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { COLORS } from '../constants/colors';
import appIcon from '../app_icon.png';

const ReportsPage = ({ 
  reports, 
  walletConnected, 
  account, 
  isOwner, 
  connectWallet, 
  disconnectWallet,
  verifyReport,
  preview,
  togglePreview,
  loading,
  error
}) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: COLORS.darkNavy }}>
      <motion.div 
        className="max-w-4xl mx-auto relative"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Wallet Section - Top Right */}
        <motion.div 
          className="absolute top-0 right-0"
          variants={itemVariants}
        >
          <div className="flex flex-col items-end space-y-2">
            {walletConnected ? (
              <>
                <button
                  className="px-4 py-2 rounded-full text-white text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  style={{ 
                    backgroundColor: COLORS.deepRed,
                    boxShadow: '0 4px 14px 0 rgba(135, 35, 65, 0.3)'
                  }}
                  onClick={disconnectWallet}
                >
                  Disconnect Wallet
                </button>
                <p className="text-xs font-medium text-white">Connected: {account}</p>
                {isOwner && (
                  <p className="text-xs font-medium" style={{ color: COLORS.coral }}>
                    Law Enforcement Access Granted
                  </p>
                )}
                {!isOwner && (
                  <p className="text-xs font-medium text-red-500">
                    Access Denied - Law Enforcement Only
                  </p>
                )}
              </>
            ) : (
              <button
                className="px-4 py-2 rounded-full text-white text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                style={{ 
                  backgroundColor: COLORS.brightRed,
                  boxShadow: '0 4px 14px 0 rgba(190, 49, 68, 0.3)'
                }}
                onClick={connectWallet}
              >
                Connect Law Enforcement Wallet
              </button>
            )}
          </div>
        </motion.div>

        {/* Main Header with Logo */}
        <motion.div 
          className="flex items-center justify-center mb-8 pt-16"
          variants={itemVariants}
        >
          <img 
            src={appIcon} 
            alt="BSafe Logo" 
            className="w-16 h-16 mr-4"
            style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
          />
          <h1 className="text-4xl font-bold text-center text-white">
            BSafe Control Center
          </h1>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-lg text-white">
              Monitor and respond to safety alerts and incident reports
            </p>
            {isOwner && (
              <motion.button
                variants={itemVariants}
                className="flex items-center px-4 py-2 rounded-full text-white text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg ml-4"
                style={{ 
                  backgroundColor: COLORS.brightRed,
                  boxShadow: '0 4px 14px 0 rgba(190, 49, 68, 0.3)'
                }}
                onClick={() => navigate('/analysis')}
              >
                <ChartBar className="w-4 h-4 mr-2" />
                View Crime Analytics
              </motion.button>
            )}
          </div>
        </motion.div>

        {!walletConnected && (
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 text-center"
            variants={itemVariants}
          >
            <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.deepRed }} />
            <h2 className="text-2xl font-medium mb-3 text-white">
              Law Enforcement Access Required
            </h2>
            <p className="text-base text-white">
              Please connect with a law enforcement wallet to view and manage reports.
            </p>
          </motion.div>
        )}

        {walletConnected && !isOwner && (
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 text-center"
            variants={itemVariants}
          >
            <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.deepRed }} />
            <h2 className="text-2xl font-medium mb-3 text-white">
              Unauthorized Access
            </h2>
            <p className="text-base text-white">
              This portal is restricted to authorized law enforcement only. Please connect with a law enforcement wallet.
            </p>
          </motion.div>
        )}

        {loading && (
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 text-center mb-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center">
              <Activity className="w-6 h-6 animate-spin mr-3 text-white" />
              <p className="text-white">Processing incident reports...</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            className="bg-red-50 rounded-xl shadow-lg p-8 text-center backdrop-blur-sm mb-6"
            variants={itemVariants}
          >
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {isOwner && !loading && !error && (
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
          >
            {reports.length === 0 ? (
              <motion.div 
                className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 text-center"
                variants={itemVariants}
              >
                <p className="text-base text-white">
                  No reports available at this time.
                </p>
              </motion.div>
            ) : (
              reports.map((report) => (
                <motion.div
                  key={report.id}
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Header Section */}
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/20">
                    <div>
                      <h2 className="text-xl font-medium mb-1 text-white">Case #{report.id}</h2>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium mb-2 ${
                        report.verified 
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {report.verified ? 'Verified' : 'Under Investigation'}
                      </span>
                      {report.reward > 0 && (
                        <div className="flex items-center text-sm font-medium text-white">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>{report.reward} ETH</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="space-y-6">
                    {/* Location Section */}
                    <div className="flex items-start">
                      <MapPin className="w-6 h-6 mr-3 mt-1" style={{ color: COLORS.brightRed }} />
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: COLORS.coral }}>Location</p>
                        <p className="text-base text-white/90">{report.location || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Situation Section */}
                    <div className="flex items-start">
                      <AlertTriangle className="w-6 h-6 mr-3 mt-1" style={{ color: COLORS.brightRed }} />
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: COLORS.coral }}>Situation Details</p>
                        <p className="text-base leading-relaxed text-white/90">{report.description}</p>
                      </div>
                    </div>

                    {/* Evidence Section with Analysis */}
                    {report.evidenceLink && (
                      <div className="border-t border-white/20 pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-medium" style={{ color: COLORS.coral }}>Supporting Evidence</p>
                          <button 
                            className="text-sm text-white px-5 py-2 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            style={{ 
                              backgroundColor: COLORS.brightRed,
                              boxShadow: '0 4px 14px 0 rgba(190, 49, 68, 0.3)'
                            }}
                            onClick={() => togglePreview(report.evidenceLink)}
                          >
                            {preview === report.evidenceLink ? 'Hide Evidence' : 'View Evidence'}
                          </button>
                        </div>

                        {/* Analysis Results */}
                        {report.analysis_status === 'success' && (
                          <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium" style={{ color: COLORS.coral }}>Analysis Results</span>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                report.is_violent 
                                  ? 'bg-red-500 text-white'
                                  : 'bg-green-500 text-white'
                              }`}>
                                {report.label}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="flex-1 bg-white/10 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    report.is_violent ? 'bg-red-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${report.confidence * 100}%` }}
                                ></div>
                              </div>
                              <span className="ml-3 text-sm font-medium text-white/90">
                                {(report.confidence * 100).toFixed(1)}% Confidence
                              </span>
                            </div>
                          </div>
                        )}

                        {report.analysis_status === 'failed' && (
                          <div className="bg-red-500/10 rounded-lg p-4 mb-4">
                            <p className="text-red-400 text-sm">Analysis failed: {report.error}</p>
                          </div>
                        )}

                        {preview === report.evidenceLink && (
                          <div className="mt-4">
                            <img 
                              src={report.evidenceLink} 
                              alt="Evidence" 
                              className="w-full rounded-lg shadow-lg"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!report.verified && (
                      <div className="flex justify-end pt-4 border-t border-white/20">
                        <button
                          className="flex items-center px-6 py-2.5 rounded-full text-white text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-gradient-to-r from-brightRed to-coral"
                          onClick={() => verifyReport(report.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify & Reward
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ReportsPage; 