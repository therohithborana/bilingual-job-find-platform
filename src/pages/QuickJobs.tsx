import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MapPin, Clock, Zap, Hammer, Wrench, Plug, PaintBucket, Droplet, Fan } from "lucide-react";

const SERVICES = [
  { name: "Electrician", icon: <Plug className="h-6 w-6" /> },
  { name: "Plumber", icon: <Droplet className="h-6 w-6" /> },
  { name: "Carpenter", icon: <Hammer className="h-6 w-6" /> },
  { name: "Painter", icon: <PaintBucket className="h-6 w-6" /> },
  { name: "AC Technician", icon: <Fan className="h-6 w-6" /> },
  { name: "General Repair", icon: <Wrench className="h-6 w-6" /> },
];

const QuickJobs = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleRequestService = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to request services");
      navigate("/login");
      return;
    }
    
    navigate("/request-service");
  };

  const handleFindWork = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to find work");
      navigate("/login");
      return;
    }
    
    if (user?.role !== "worker") {
      toast.error("Only workers can access this section");
      return;
    }
    
    navigate("/worker/service-requests");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quick Services</h1>
          <p className="text-muted-foreground">
            Connect with skilled workers in your area for immediate assistance
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
            For Customers
          </div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Request Quick Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Need immediate help? Request a service and nearby workers will send you quotes in real-time.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {SERVICES.map((service) => (
                <div 
                  key={service.name}
                  className="flex flex-col items-center p-3 bg-muted/50 rounded-md"
                >
                  <div className="text-primary mb-1">{service.icon}</div>
                  <div className="text-xs font-medium">{service.name}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                <span>Fast response from local workers</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-500" />
                <span>Get multiple quotes within minutes</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleRequestService}
            >
              Request Service Now
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
            For Workers
          </div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              Find Quick Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Are you a skilled worker? Find nearby service requests and place bids to get hired instantly.
            </p>
            <div className="space-y-2 mb-4">
              <div className="p-3 bg-muted/50 rounded-md">
                <div className="font-medium mb-1">How it works:</div>
                <ol className="list-decimal ml-5 text-sm space-y-1">
                  <li>Browse service requests near you</li>
                  <li>Place a bid with your price and arrival time</li>
                  <li>Get notified instantly when hired</li>
                  <li>Complete the work and get paid</li>
                </ol>
              </div>
            </div>
            <div className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span>Real-time location-based job matching</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleFindWork}
              variant={user?.role === "worker" ? "default" : "secondary"}
            >
              {user?.role === "worker" ? "Find Work Nearby" : "For Workers Only"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">How Our Quick Services Work</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              1
            </div>
            <h3 className="font-medium mb-2">Request or Offer</h3>
            <p className="text-sm text-muted-foreground">
              Customers request services with their location and details. Workers see nearby opportunities.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              2
            </div>
            <h3 className="font-medium mb-2">Real-time Bidding</h3>
            <p className="text-sm text-muted-foreground">
              Workers place competitive bids with their rates and estimated arrival times.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              3
            </div>
            <h3 className="font-medium mb-2">Connect & Complete</h3>
            <p className="text-sm text-muted-foreground">
              Customers select their preferred worker, who arrives promptly to complete the service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickJobs;
