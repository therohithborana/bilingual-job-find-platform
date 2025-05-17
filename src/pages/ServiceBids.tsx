import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSocketEvent, useNewBids, acceptBid, initializeSocket } from "@/lib/socketService";
import { MapPin, Clock, Calendar, AlertCircle, User, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Helper to format date/time
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString();
};

// Helper to get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const ServiceBids = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Get request data using socket event hook
  const [requestData, isLoadingRequest] = useSocketEvent<any>('request_data', null);
  
  // Get bids for this request
  const bids = useNewBids(requestId || '');
  
  // UI states
  const [selectedBid, setSelectedBid] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to view bids");
      navigate("/login");
      return;
    }
    
    // Fetch request data on component mount
    // In a real app, you would emit an event to get this specific request's data
    if (requestId) {
      const socket = initializeSocket();
      socket.emit('get_request_data', { requestId });
    }
  }, [isAuthenticated, navigate, requestId]);
  
  // Handle accept bid
  const handleAcceptBid = async () => {
    if (!selectedBid || !requestId) {
      toast.error("Please select a bid first");
      return;
    }
    
    setIsAccepting(true);
    
    try {
      acceptBid(requestId, selectedBid);
      toast.success("Bid accepted! The worker has been notified.");
      
      // In a real app, you'd navigate to a service tracking page
      // For now, just go back to the quick jobs page
      setTimeout(() => {
        navigate("/quick-jobs");
      }, 2000);
    } catch (error) {
      console.error("Error accepting bid:", error);
      toast.error("Failed to accept bid. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };
  
  // Loading state
  if (isLoadingRequest) {
    return (
      <div className="container mx-auto py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading service request...</p>
      </div>
    );
  }
  
  // No request found state
  if (!requestData && !isLoadingRequest) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <CardTitle>Request Not Found</CardTitle>
            <CardDescription>
              The service request you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate("/quick-jobs")}>
              Back to Quick Services
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // For development without actual server data
  const mockRequestData = {
    id: requestId,
    customerId: user?._id,
    customerName: user?.name || "Customer",
    serviceType: "Electrician",
    description: "Need to fix a power outlet that stopped working",
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
    },
    status: "pending",
    createdAt: new Date().toISOString(),
    bids: [],
  };
  
  // Use either real data or mock data
  const serviceRequest = requestData || mockRequestData;
  
  // For development without actual bids
  const mockBids = [
    {
      workerId: "worker1",
      workerName: "Rajesh Kumar",
      amount: 500,
      estimatedArrivalTime: "30 minutes",
      rating: 4.7,
      completedJobs: 28,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      workerId: "worker2",
      workerName: "Suresh M",
      amount: 650,
      estimatedArrivalTime: "15 minutes",
      rating: 4.9,
      completedJobs: 42,
      timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    },
  ];
  
  // Combine real bids with mock bids for development
  const allBids = bids.length > 0 ? bids : mockBids;
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Service Request Details</CardTitle>
                <CardDescription>
                  Created on {formatDateTime(serviceRequest.createdAt)}
                </CardDescription>
              </div>
              <Badge 
                variant={serviceRequest.status === "pending" ? "outline" : "secondary"}
                className="capitalize"
              >
                {serviceRequest.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{serviceRequest.serviceType}</h3>
              <p className="text-muted-foreground">{serviceRequest.description}</p>
            </div>
            
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Location coordinates: {serviceRequest.location.latitude.toFixed(6)}, {serviceRequest.location.longitude.toFixed(6)}</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Worker Bids</h2>
          <p className="text-muted-foreground">
            {allBids.length === 0 
              ? "Waiting for workers to place bids. This usually takes a few minutes."
              : `${allBids.length} worker${allBids.length === 1 ? "" : "s"} have placed bids`}
          </p>
        </div>
        
        {allBids.length === 0 ? (
          <Card className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Waiting for bids from nearby workers...</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {allBids.map((bid, index) => (
              <Card 
                key={index}
                className={`transition-all ${selectedBid === bid.workerId ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(bid.workerName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{bid.workerName}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                          <span>{bid.rating} ({bid.completedJobs} jobs)</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg font-semibold">
                      ₹{bid.amount}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Can arrive in {bid.estimatedArrivalTime}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Bid placed {formatDateTime(bid.timestamp)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={selectedBid === bid.workerId ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedBid(bid.workerId)}
                  >
                    {selectedBid === bid.workerId ? "Selected" : "Select This Bid"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {selectedBid && (
              <div className="pt-4">
                <Separator className="my-4" />
                <div className="flex justify-end">
                  <Button 
                    size="lg" 
                    onClick={handleAcceptBid}
                    disabled={isAccepting}
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      "Accept Selected Bid"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceBids; 