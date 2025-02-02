import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { MapIcon, BarChart2Icon, ActivityIcon, UsersIcon } from 'lucide-react';
import L from 'leaflet';
import 'leaflet.heat';
import { COLORS } from '../constants/colors';
import 'leaflet/dist/leaflet.css';

// Fix for the marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Helper component to add heatmap layer
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heatLayer = L.heatLayer(
      points.map(point => [point[0], point[1], 0.5]), // lat, lng, intensity
      {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
          0.4: '#30E3CA',
          0.6: '#11999E',
          0.8: '#40514E'
        }
      }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const AnalysisDashboard = ({ reports, isVisible, loading, error }) => {
  const [locations, setLocations] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [statistics, setStatistics] = useState({
    totalReports: 0,
    verifiedReports: 0,
    pendingReports: 0,
    totalSupport: 0
  });
  const [trendsData, setTrendsData] = useState([]);

  // Process reports data for trends chart
  const processReportsData = (reports) => {
    if (!Array.isArray(reports) || reports.length === 0) return [];

    // Create a map to store reports count by month
    const monthlyData = new Map();
    const monthlyVerified = new Map();
    const monthlyPending = new Map();

    reports.forEach(report => {
      // Convert timestamp to date object
      const date = new Date(report.timestamp || Date.now());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Initialize if month doesn't exist
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, 0);
        monthlyVerified.set(monthKey, 0);
        monthlyPending.set(monthKey, 0);
      }

      // Increment counters
      monthlyData.set(monthKey, monthlyData.get(monthKey) + 1);
      if (report.verified) {
        monthlyVerified.set(monthKey, monthlyVerified.get(monthKey) + 1);
      } else {
        monthlyPending.set(monthKey, monthlyPending.get(monthKey) + 1);
      }
    });

    // Convert to array and sort by date
    const sortedData = Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, total]) => ({
        month: formatMonthLabel(month),
        total,
        verified: monthlyVerified.get(month),
        pending: monthlyPending.get(month)
      }));

    return sortedData;
  };

  // Format month label for display
  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
  };

  // Function to extract coordinates from location string
  const extractCoordinates = (locationStr) => {
    // Common patterns for coordinates in the location string
    const patterns = [
      /(\d+\.?\d*)[,\s]+(\d+\.?\d*)/, // Basic format: "lat, lng" or "lat lng"
      /(\d+°\d+'?\d*"?[NS])[,\s]+(\d+°\d+'?\d*"?[EW])/, // DMS format
      /location:\s*\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/ // Location object format
    ];

    for (let pattern of patterns) {
      const match = locationStr.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      }
    }

    // Fallback: Generate coordinates around Mumbai for demo
    const lat = 19.0760 + (Math.random() - 0.5) * 0.1;
    const lng = 72.8777 + (Math.random() - 0.5) * 0.1;
    return [lat, lng];
  };

  useEffect(() => {
    // Process reports data for statistics and map
    if (reports && Array.isArray(reports)) {
      const reportStats = reports.reduce((acc, report) => {
        const reward = parseFloat(report.reward) || 0;
        return {
          totalReports: acc.totalReports + 1,
          verifiedReports: report.verified ? acc.verifiedReports + 1 : acc.verifiedReports,
          pendingReports: !report.verified ? acc.pendingReports + 1 : acc.pendingReports,
          totalSupport: acc.totalSupport + reward
        };
      }, {
        totalReports: 0,
        verifiedReports: 0,
        pendingReports: 0,
        totalSupport: 0
      });

      setStatistics(reportStats);

      // Process trends data
      const processedTrends = processReportsData(reports);
      setTrendsData(processedTrends);

      // Process locations for map
      const processedLocations = reports.map(report => {
        const [lat, lng] = extractCoordinates(report.location || '');
        return {
          id: report.id,
          position: [lat, lng],
          description: report.description,
          verified: report.verified,
          timestamp: report.timestamp,
          location: report.location
        };
      });

      // Group locations by proximity for heatmap
      const points = processedLocations.map(loc => loc.position);
      setHeatmapPoints(points);
      setLocations(processedLocations);
    }
  }, [reports]);

  if (!isVisible) return null;

  const customIcon = (verified) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${verified ? '#10B981' : '#F59E0B'}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [15, 15],
      iconAnchor: [7, 7]
    });
  };

  // Format number to 2 decimal places safely
  const formatNumber = (num) => {
    const value = parseFloat(num);
    return isNaN(value) ? '0.00' : value.toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-white"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Crime Analytics Dashboard
        </h2>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md rounded-lg p-4 shadow-sm border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Incidents</p>
                <h3 className="text-2xl font-bold text-white">
                  {statistics.totalReports}
                </h3>
              </div>
              <ActivityIcon className="w-8 h-8" style={{ color: COLORS.coral }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-md rounded-lg p-4 shadow-sm border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Verified Cases</p>
                <h3 className="text-2xl font-bold text-white">
                  {statistics.verifiedReports}
                </h3>
              </div>
              <UsersIcon className="w-8 h-8" style={{ color: COLORS.brightRed }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-md rounded-lg p-4 shadow-sm border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Under Investigation</p>
                <h3 className="text-2xl font-bold text-white">
                  {statistics.pendingReports}
                </h3>
              </div>
              <BarChart2Icon className="w-8 h-8" style={{ color: COLORS.deepRed }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-md rounded-lg p-4 shadow-sm border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Rewards (ETH)</p>
                <h3 className="text-2xl font-bold text-white">
                  {formatNumber(statistics.totalSupport)}
                </h3>
              </div>
              <MapIcon className="w-8 h-8" style={{ color: COLORS.coral }} />
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-6 rounded-lg overflow-hidden shadow-sm border border-white/10 bg-white/5 backdrop-blur-md"
          style={{ height: '400px' }}
        >
          {typeof window !== 'undefined' && (
            <MapContainer
              center={[19.0760, 72.8777]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <HeatmapLayer points={heatmapPoints} />
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={location.position}
                  icon={customIcon(location.verified)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold mb-1">Incident #{location.id}</h3>
                      <p className="text-sm">{location.description}</p>
                      <p className="text-xs mt-1">{location.location}</p>
                      <p className="text-xs mt-1" style={{ 
                        color: location.verified ? COLORS.brightRed : COLORS.coral,
                        fontWeight: 'bold'
                      }}>
                        {location.verified ? 'Verified' : 'Under Investigation'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </motion.div>

        {/* Trends Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 backdrop-blur-md rounded-lg p-4 shadow-sm border border-white/10"
        >
          <h3 className="text-lg font-bold mb-4 text-white">
            Crime Incident Trends
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'white' }}
                />
                <YAxis tick={{ fill: 'white' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(9, 18, 44, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Bar 
                  name="Total Incidents" 
                  dataKey="total" 
                  fill={COLORS.coral}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  name="Verified Cases" 
                  dataKey="verified" 
                  fill={COLORS.brightRed}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  name="Under Investigation" 
                  dataKey="pending" 
                  fill={COLORS.deepRed}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {trendsData.length === 0 && (
            <p className="text-center text-gray-400 mt-4">
              No incident data available for trends visualization
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnalysisDashboard; 