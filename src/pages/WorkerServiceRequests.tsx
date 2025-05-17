import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { registerWithSocketServer, useActiveRequests, placeBid, useGeolocation } from "@/lib/socketService";
import { MapPin, Clock, Info, Zap, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Helper to format time
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString();
};

const WorkerServiceRequests = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeRequests, isLoadingRequests] = useActiveRequests();
  const { location } = useGeolocation();
  
  // Bidding state
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [arrivalTime, setArrivalTime] = useState<string>("30");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  
  // Redirect if not authenticated or not a worker
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to view service requests");
      navigate("/login");
      return;
    }
    
    if (user?.role !== "worker") {
      toast.error("Only workers can view service requests");
      navigate("/");
      return;
    }
  }, [isAuthenticated, navigate, user]);
  
  // Register with socket server when location is available
  useEffect(() => {
    if (isAuthenticated && user && location) {
      registerWithSocketServer({
        userId: user._id,
        role: user.role,
        location,
        serviceTypes: ["Electrician", "Plumber", "Carpenter"], // This would come from worker profile
        isAvailable: true
      });
    }
  }, [isAuthenticated, user, location]);
  
  // Handle bid submission
  const handleSubmitBid = async () => {
    if (!selectedRequest || !bidAmount || !arrivalTime) {
      toast.error("Please fill in all bid details");
      return;
    }
    
    if (!user) {
      toast.error("User information not available");
      return;
    }
    
    setIsPlacingBid(true);
    
    try {
      placeBid({
        requestId: selectedRequest,
        workerId: user._id,
        amount: parseFloat(bidAmount),
        estimatedArrivalTime: `${arrivalTime} minutes`
      });
      
      toast.success("Bid placed successfully!");
      setSelectedRequest(null);
      setBidAmount("");
      setArrivalTime("30");
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Failed to place bid. Please try again.");
    } finally {
      setIsPlacingBid(false);
    }
  };
  
  // Show mock data for development
  const mockRequests = [
    {
      id: "request1",
      customerId: "customer1",
      customerName: "John Doe",
      serviceType: "Electrician",
      description: "Need to fix a power outlet that stopped working in the master bedroom.",
      location: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      distance: 2.3, // in km
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
      status: "pending"
    },
    {
      id: "request2",
      customerId: "customer2",
      customerName: "Jane Smith",
      serviceType: "Plumber",
      description: "Leaking faucet in kitchen. Need immediate repair.",
      location: {
        latitude: 12.9816,
        longitude: 77.6046
      },
      distance: 4.1, // in km
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
      status: "pending"
    }
  ];
  
  // Use either real data from socket or mock data for development
  const serviceRequests = activeRequests && activeRequests.length > 0 ? activeRequests : mockRequests;
  
  // Loading state
  if (isLoadingRequests) {
    return (
      <div className="container mx-auto py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading service requests...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Nearby Service Requests</h1>
            <p className="text-muted-foreground">
              Find quick work opportunities in your area
            </p>
          </div>
          
          {location && (
            <Badge variant="outline" className="text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Badge>
          )}
        </div>
        
        <Tabs defaultValue="available">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Requests</TabsTrigger>
            <TabsTrigger value="my-bids">My Bids</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-6">
            {serviceRequests.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">No Requests Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    There are no service requests in your area at the moment.
                    <br />
                    Check back later or expand your service radius.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {serviceRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle>{request.serviceType}</CardTitle>
                          <CardDescription>
                            Posted by {request.customerName} • {formatDateTime(request.createdAt)}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          {request.distance} km away
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground mb-3">
                        {request.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>
                          Location: {request.location.latitude.toFixed(6)}, {request.location.longitude.toFixed(6)}
                        </span>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => setSelectedRequest(request.id)}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Place a Bid
                      </Button>
                    </CardFooter>
                    
                    {selectedRequest === request.id && (
                      <div className="px-6 pb-6 pt-2">
                        <Separator className="my-3" />
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="bidAmount">Your Bid Amount (₹)</Label>
                              <Input
                                id="bidAmount"
                                type="number"
                                placeholder="e.g. 500"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="arrivalTime">Estimated Arrival (mins)</Label>
                              <Input
                                id="arrivalTime"
                                type="number"
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-3">
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedRequest(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSubmitBid}
                              disabled={isPlacingBid}
                            >
                              {isPlacingBid ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                "Submit Bid"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-bids" className="mt-6">
            <Card className="text-center py-12">
              <CardContent>
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Your Bid History</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  You have not placed any bids yet.
                  <br />
                  Browse available service requests to start bidding.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkerServiceRequests; 