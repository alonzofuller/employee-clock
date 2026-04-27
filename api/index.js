// Vercel API endpoint for Employee Clock data
// This provides a central backend for syncing data across all computers

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    timers: [],
    appSessions: [],
    appCosts: [],
    auditLog: [],
    payrollPeriods: [],
    lastUpdated: null
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { timers: [], appSessions: [], appCosts: [], auditLog: [], payrollPeriods: [], lastUpdated: null };
  }
}

function writeData(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = (req, res) => {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const data = readData();

  if (req.method === 'GET') {
    // Return all data
    return res.status(200).json({
      success: true,
      data: data,
      lastUpdated: data.lastUpdated
    });
  }

  if (req.method === 'POST') {
    // Update data with incoming changes
    const updates = req.body;
    
    if (updates.timers !== undefined) data.timers = updates.timers;
    if (updates.appSessions !== undefined) data.appSessions = updates.appSessions;
    if (updates.appCosts !== undefined) data.appCosts = updates.appCosts;
    if (updates.auditLog !== undefined) data.auditLog = updates.auditLog;
    if (updates.payrollPeriods !== undefined) data.payrollPeriods = updates.payrollPeriods;
    
    writeData(data);
    
    return res.status(200).json({
      success: true,
      message: 'Data saved successfully',
      lastUpdated: data.lastUpdated
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};