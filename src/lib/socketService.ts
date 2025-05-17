import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Define the server URL
const SERVER_URL = import.meta.env.PROD 
  ? window.location.origin 
  : 'http://localhost:3000';

// Socket instance
let socket: Socket | null = null;

// Initialize socket connection
export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(SERVER_URL);
    
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  
  return socket;
};

// Register user with socket server
export const registerWithSocketServer = (userData: {
  userId: string;
  role: 'worker' | 'recruiter';
  location?: { latitude: number; longitude: number };
  serviceTypes?: string[];
  isAvailable?: boolean;
}): void => {
  const socketInstance = initializeSocket();
  socketInstance.emit('register', userData);
};

// Update user location
export const updateLocation = (userId: string, location: { latitude: number; longitude: number }): void => {
  if (socket) {
    socket.emit('update_location', { userId, location });
  }
};

// Create new service request
export const createServiceRequest = (requestData: {
  customerId: string;
  customerName: string;
  serviceType: string;
  location: { latitude: number; longitude: number };
  description: string;
  budgetMax?: number;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const socketInstance = initializeSocket();
    
    // Set up one-time event handler for request creation confirmation
    socketInstance.once('request_created', (data) => {
      resolve(data);
    });
    
    // Emit the request
    socketInstance.emit('new_service_request', requestData);
    
    // Set timeout for response
    setTimeout(() => {
      reject(new Error('Request creation timed out'));
    }, 10000); // 10 seconds timeout
  });
};

// Worker places a bid on a service request
export const placeBid = (bidData: {
  requestId: string;
  workerId: string;
  amount: number;
  estimatedArrivalTime: string;
}): void => {
  if (socket) {
    socket.emit('place_bid', bidData);
  }
};

// Customer accepts a bid from a worker
export const acceptBid = (requestId: string, workerId: string): void => {
  if (socket) {
    socket.emit('accept_bid', { requestId, workerId });
  }
};

// Mark service as complete with rating
export const completeService = (requestId: string, rating: number, comment?: string): void => {
  if (socket) {
    socket.emit('complete_service', { requestId, rating, comment });
  }
};

// Custom hook for listening to socket events
export const useSocketEvent = <T>(eventName: string, defaultValue: T): [T, boolean] => {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const socketInstance = initializeSocket();
    
    socketInstance.on(eventName, (receivedData) => {
      setData(receivedData);
      setIsLoading(false);
    });
    
    return () => {
      socketInstance.off(eventName);
    };
  }, [eventName]);
  
  return [data, isLoading];
};

// Hook for active service requests (for workers)
export const useActiveRequests = () => {
  return useSocketEvent<any[]>('active_requests', []);
};

// Hook for new bids (for customers)
export const useNewBids = (requestId: string) => {
  const [allBids, setAllBids] = useState<any[]>([]);
  
  useEffect(() => {
    const socketInstance = initializeSocket();
    
    // Listen for new bids
    socketInstance.on('new_bid', (data) => {
      if (data.requestId === requestId) {
        setAllBids(prev => [...prev, data.bid]);
      }
    });
    
    return () => {
      socketInstance.off('new_bid');
    };
  }, [requestId]);
  
  return allBids;
};

// Custom hook for geolocation
export const useGeolocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }
    
    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
      }
    );
    
    // Set up watch position for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setError(null);
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
      }
    );
    
    // Clean up
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);
  
  return { location, error, isLoading };
};

// Disconnect socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initializeSocket,
  registerWithSocketServer,
  updateLocation,
  createServiceRequest,
  placeBid,
  acceptBid,
  completeService,
  useSocketEvent,
  useActiveRequests,
  useNewBids,
  useGeolocation,
  disconnectSocket
}; 