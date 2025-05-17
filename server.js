const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Serve static files from the dist directory after build
app.use(express.static(path.join(__dirname, 'dist')));

// Route all requests to the index.html file (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Store active service requests and connected workers
const activeRequests = new Map();
const connectedWorkers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle user type identification
  socket.on('register', (userData) => {
    const { userId, role, location } = userData;
    
    // Store worker information if they are a worker
    if (role === 'worker') {
      connectedWorkers.set(userId, {
        socketId: socket.id,
        location,
        serviceTypes: userData.serviceTypes || [],
        isAvailable: userData.isAvailable || true
      });
      
      // Send active service requests to the worker
      const nearbyRequests = findNearbyRequests(location, 10); // 10km radius
      socket.emit('active_requests', nearbyRequests);
    }
    
    // Associate socket with user ID for future reference
    socket.userId = userId;
    socket.role = role;
  });
  
  // Handle location updates
  socket.on('update_location', (data) => {
    const { userId, location } = data;
    
    if (socket.role === 'worker' && connectedWorkers.has(userId)) {
      const workerData = connectedWorkers.get(userId);
      workerData.location = location;
      connectedWorkers.set(userId, workerData);
      
      // Update worker with nearby service requests
      const nearbyRequests = findNearbyRequests(location, 10);
      socket.emit('active_requests', nearbyRequests);
    }
  });
  
  // Handle new service request
  socket.on('new_service_request', (requestData) => {
    const requestId = `request-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const newRequest = {
      id: requestId,
      ...requestData,
      status: 'pending',
      bids: [],
      createdAt: new Date().toISOString()
    };
    
    // Store the request
    activeRequests.set(requestId, newRequest);
    
    // Find nearby workers and notify them
    const nearbyWorkers = findNearbyWorkers(requestData.location, 10, requestData.serviceType);
    
    nearbyWorkers.forEach(workerId => {
      const workerSocketId = connectedWorkers.get(workerId).socketId;
      io.to(workerSocketId).emit('new_request', newRequest);
    });
    
    // Confirm to the customer
    socket.emit('request_created', newRequest);
  });
  
  // Handle worker bids
  socket.on('place_bid', (bidData) => {
    const { requestId, workerId, amount, estimatedArrivalTime } = bidData;
    
    if (activeRequests.has(requestId)) {
      const request = activeRequests.get(requestId);
      
      // Add bid to request
      const newBid = {
        workerId,
        amount,
        estimatedArrivalTime,
        timestamp: new Date().toISOString()
      };
      
      request.bids.push(newBid);
      activeRequests.set(requestId, request);
      
      // Notify the customer about the new bid
      const customerSocketId = findSocketIdByUserId(request.customerId);
      if (customerSocketId) {
        io.to(customerSocketId).emit('new_bid', {
          requestId,
          bid: newBid
        });
      }
    }
  });
  
  // Handle bid acceptance
  socket.on('accept_bid', (data) => {
    const { requestId, workerId } = data;
    
    if (activeRequests.has(requestId)) {
      const request = activeRequests.get(requestId);
      
      // Update request status
      request.status = 'accepted';
      request.acceptedWorkerId = workerId;
      activeRequests.set(requestId, request);
      
      // Notify the accepted worker
      const workerSocketId = connectedWorkers.get(workerId)?.socketId;
      if (workerSocketId) {
        io.to(workerSocketId).emit('bid_accepted', { requestId });
      }
      
      // Notify other workers who bid that request is no longer available
      request.bids.forEach(bid => {
        if (bid.workerId !== workerId) {
          const otherWorkerSocketId = connectedWorkers.get(bid.workerId)?.socketId;
          if (otherWorkerSocketId) {
            io.to(otherWorkerSocketId).emit('request_closed', { requestId });
          }
        }
      });
    }
  });
  
  // Handle service completion
  socket.on('complete_service', (data) => {
    const { requestId, rating, comment } = data;
    
    if (activeRequests.has(requestId)) {
      const request = activeRequests.get(requestId);
      
      // Update request status
      request.status = 'completed';
      request.rating = rating;
      request.comment = comment;
      
      // Archive request or perform other actions
      // ...
      
      // Notify worker and customer
      const workerSocketId = connectedWorkers.get(request.acceptedWorkerId)?.socketId;
      if (workerSocketId) {
        io.to(workerSocketId).emit('service_completed', { requestId, rating, comment });
      }
      
      socket.emit('completion_confirmed', { requestId });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Clean up worker data if a worker disconnects
    if (socket.role === 'worker' && socket.userId) {
      connectedWorkers.delete(socket.userId);
    }
  });
});

// Helper function to find nearby service requests based on geolocation
function findNearbyRequests(location, radiusKm, serviceType = null) {
  const nearbyRequests = [];
  
  for (const [requestId, request] of activeRequests.entries()) {
    if (request.status === 'pending') {
      const distance = calculateDistance(
        location.latitude, 
        location.longitude, 
        request.location.latitude, 
        request.location.longitude
      );
      
      if (distance <= radiusKm && (!serviceType || request.serviceType === serviceType)) {
        nearbyRequests.push({
          ...request,
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
        });
      }
    }
  }
  
  return nearbyRequests;
}

// Helper function to find nearby workers
function findNearbyWorkers(location, radiusKm, serviceType = null) {
  const nearbyWorkerIds = [];
  
  for (const [workerId, worker] of connectedWorkers.entries()) {
    if (worker.isAvailable) {
      const distance = calculateDistance(
        location.latitude, 
        location.longitude, 
        worker.location.latitude, 
        worker.location.longitude
      );
      
      if (distance <= radiusKm && 
          (!serviceType || worker.serviceTypes.includes(serviceType))) {
        nearbyWorkerIds.push(workerId);
      }
    }
  }
  
  return nearbyWorkerIds;
}

// Helper function to find socket ID by user ID
function findSocketIdByUserId(userId) {
  for (const socket of io.sockets.sockets.values()) {
    if (socket.userId === userId) {
      return socket.id;
    }
  }
  return null;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 