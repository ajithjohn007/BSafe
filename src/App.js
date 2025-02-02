import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from './config';
import ReportsPage from './pages/reports_page';
import AnalysisPage from './pages/analysis_page';
import './App.css';

// Replace with the actual owner's address of the deployed contract
const OWNER_ADDRESS = "0x6054060A93943D7eAB480B815dC2E2350Ae48C19";

function App() {
  const [reports, setReports] = useState([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reports from the ML analysis backend
  useEffect(() => {
    if (isOwner) {
      setLoading(true);
      setError(null);
      axios.get('http://localhost:8503/analyze/reports')
        .then((response) => {
          // The response now includes analysis results
          setReports(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching reports:', error);
          setError('Failed to fetch reports. Please make sure the analysis server is running.');
          setLoading(false);
        });
    } else {
      setReports([]); // Clear reports when not owner
    }
  }, [isOwner]);

  // Wallet connection logic
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const connectedAccount = accounts[0];
        setAccount(connectedAccount);

        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
        
        // Check if the connected account is the owner
        setIsOwner(connectedAccount.toLowerCase() === OWNER_ADDRESS.toLowerCase());
        
        setWalletConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setWalletConnected(false);
    setContract(null);
    setIsOwner(false);
  };

  // Verifying reports
  const verifyReport = async (reportId) => {
    if (!contract) return;

    try {
      const rewardAmount = prompt("Enter reward amount (in ETH):");
      const tx = await contract.verifyReport(reportId, ethers.parseEther(rewardAmount), {
        value: ethers.parseEther(rewardAmount),
      });
      await tx.wait();
      alert("Report verified successfully!");

      // Refresh the reports after verification
      setLoading(true);
      const response = await axios.get('http://localhost:8503/analyze/reports');
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error verifying report:', error);
      alert('Failed to verify the report');
    }
  };

  // Function to toggle image preview
  const togglePreview = (link) => {
    setPreview(preview === link ? null : link);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <ReportsPage
              reports={reports}
              walletConnected={walletConnected}
              account={account}
              isOwner={isOwner}
              connectWallet={connectWallet}
              disconnectWallet={disconnectWallet}
              verifyReport={verifyReport}
              preview={preview}
              togglePreview={togglePreview}
              loading={loading}
              error={error}
            />
          }
        />
        <Route 
          path="/analysis" 
          element={
            isOwner ? (
              <AnalysisPage reports={reports} loading={loading} error={error} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
