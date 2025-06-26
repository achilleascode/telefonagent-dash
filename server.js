import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://aesthetic-tiramisu-fca7d8.netlify.app',
    /\.netlify\.app$/,
    /\.railway\.app$/,
    /\.render\.com$/,
    /\.fly\.io$/,
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    calls: calls.length,
    version: '1.0.0'
  });
});

// In-memory storage (in production, consider using a database)
let calls = [];

// Webhook endpoint for receiving call data
app.post('/webhook/call-transcription', (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('📞 Received webhook data:', JSON.stringify(webhookData, null, 2));
    
    // Extract relevant data from webhook
    const callData = {
      id: webhookData.data?.conversation_id || `call_${Date.now()}`,
      name: extractName(webhookData.data?.analysis?.data_collection_results),
      phone: webhookData.data?.metadata?.phone_call?.external_number || 'Unbekannt',
      date: webhookData.event_timestamp 
        ? new Date(webhookData.event_timestamp * 1000).toISOString()
        : new Date().toISOString(),
      duration: webhookData.data?.metadata?.call_duration_secs || 0,
      anliegen: webhookData.data?.analysis?.data_collection_results?.Anliegen?.value || 'Nicht erfasst',
      status: webhookData.data?.status || 'received',
      transcript: webhookData.data?.transcript || [],
      analysis: webhookData.data?.analysis || {},
      rawData: webhookData // Store raw data for debugging
    };

    // Add to calls array (newest first)
    calls.unshift(callData);
    
    // Keep only last 1000 calls to prevent memory issues
    if (calls.length > 1000) {
      calls = calls.slice(0, 1000);
    }
    
    console.log(`✅ New call processed: ${callData.name} (${callData.phone}) - Duration: ${callData.duration}s`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Call data received and processed successfully',
      callId: callData.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing call data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to extract name from analysis
function extractName(dataCollection) {
  if (!dataCollection) return 'Unbekannt';
  
  const vorname = dataCollection.Vorname?.value || dataCollection.vorname?.value || '';
  const nachname = dataCollection.Nachname?.value || dataCollection.nachname?.value || '';
  
  if (vorname && nachname) {
    return `${vorname} ${nachname}`;
  } else if (vorname) {
    return vorname;
  } else if (nachname) {
    return nachname;
  }
  
  return 'Unbekannt';
}

// API endpoint to get all calls (for frontend)
app.get('/api/calls', (req, res) => {
  try {
    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedCalls = calls.slice(startIndex, endIndex);
    
    res.json({
      calls: paginatedCalls,
      total: calls.length,
      page,
      limit,
      hasMore: endIndex < calls.length
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching calls',
      error: error.message 
    });
  }
});

// Get single call by ID
app.get('/api/calls/:id', (req, res) => {
  try {
    const call = calls.find(c => c.id === req.params.id);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }
    res.json(call);
  } catch (error) {
    console.error('Error fetching call:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call',
      error: error.message
    });
  }
});

// Clear all calls (for testing)
app.delete('/api/calls', (req, res) => {
  try {
    const clearedCount = calls.length;
    calls = [];
    console.log(`🗑️ Cleared ${clearedCount} calls`);
    res.json({ 
      success: true, 
      message: `All ${clearedCount} calls cleared`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing calls:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error clearing calls',
      error: error.message 
    });
  }
});

// Test endpoint to add sample data
app.post('/api/test-call', (req, res) => {
  try {
    const sampleCall = {
      id: `test_${Date.now()}`,
      name: 'Max Mustermann',
      phone: '+49 123 456789',
      date: new Date().toISOString(),
      duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
      anliegen: 'Terminvereinbarung für Beratungsgespräch',
      status: 'done',
      transcript: [
        {
          role: 'agent',
          message: 'Guten Tag, hier ist der Telefonagent von Roh-Architekten. Wie kann ich Ihnen heute helfen?',
          time_in_call_secs: 0
        },
        {
          role: 'user',
          message: 'Hallo, ich würde gerne einen Termin für ein Beratungsgespräch vereinbaren. Wir planen einen Hausumbau.',
          time_in_call_secs: 8
        },
        {
          role: 'agent',
          message: 'Das ist wunderbar! Gerne helfe ich Ihnen bei der Terminvereinbarung. Darf ich zunächst Ihren Namen erfragen?',
          time_in_call_secs: 15
        },
        {
          role: 'user',
          message: 'Ja, mein Name ist Max Mustermann.',
          time_in_call_secs: 22
        }
      ],
      analysis: {
        data_collection_results: {
          Vorname: { value: 'Max' },
          Nachname: { value: 'Mustermann' },
          Anliegen: { value: 'Terminvereinbarung für Beratungsgespräch' },
          Telefonnummer: { value: '+49 123 456789' }
        }
      }
    };
    
    calls.unshift(sampleCall);
    console.log('🧪 Test call added:', sampleCall.name);
    res.json({ 
      success: true, 
      message: 'Test call added successfully', 
      call: sampleCall,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding test call:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding test call',
      error: error.message
    });
  }
});

// Get webhook statistics
app.get('/api/stats', (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: calls.length,
      today: calls.filter(call => new Date(call.date) >= today).length,
      thisWeek: calls.filter(call => new Date(call.date) >= thisWeek).length,
      thisMonth: calls.filter(call => new Date(call.date) >= thisMonth).length,
      totalDuration: calls.reduce((sum, call) => sum + call.duration, 0),
      averageDuration: calls.length > 0 ? calls.reduce((sum, call) => sum + call.duration, 0) / calls.length : 0,
      totalCost: calls.reduce((sum, call) => sum + (call.duration / 60) * 0.29, 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requestedPath: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /health - Health check',
      'GET /api/calls - Get all calls (with pagination)',
      'GET /api/calls/:id - Get specific call',
      'POST /webhook/call-transcription - Webhook endpoint',
      'DELETE /api/calls - Clear all calls',
      'POST /api/test-call - Add test call',
      'GET /api/stats - Get statistics'
    ],
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ================================');
  console.log(`📡 Telefonagent Webhook Server`);
  console.log(`🌐 Running on port ${PORT}`);
  console.log('🚀 ================================');
  console.log(`📞 Webhook URL: http://localhost:${PORT}/webhook/call-transcription`);
  console.log(`📊 API URL: http://localhost:${PORT}/api/calls`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test Call: http://localhost:${PORT}/api/test-call`);
  console.log(`📈 Statistics: http://localhost:${PORT}/api/stats`);
  console.log('🚀 ================================');
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: https://aesthetic-tiramisu-fca7d8.netlify.app`);
  console.log('🚀 ================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});