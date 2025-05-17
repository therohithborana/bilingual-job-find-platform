import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, AlertCircle, Loader2 } from "lucide-react";
import { createServiceRequest, useGeolocation } from "@/lib/socketService";

// Service types
const SERVICE_TYPES = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "AC Technician",
  "Construction",
  "Cleaning",
  "Gardening",
];

const RequestService = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { location, error: locationError, isLoading: isLocationLoading } = useGeolocation();
  
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationName, setLocationName] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to request services");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Get location name from coordinates using reverse geocoding
  useEffect(() => {
    if (location) {
      const fetchLocationName = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data.display_name) {
            setLocationName(data.display_name);
          }
        } catch (error) {
          console.error("Error fetching location name:", error);
        }
      };

      fetchLocationName();
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !location) {
      toast.error("User information or location not available");
      return;
    }

    if (!serviceType) {
      toast.error("Please select a service type");
      return;
    }

    if (!description) {
      toast.error("Please provide a description of what you need");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        customerId: user._id,
        customerName: user.name,
        serviceType,
        location,
        description,
        budgetMax: budget ? parseFloat(budget) : undefined,
      };

      // Create service request using Socket.io
      const response = await createServiceRequest(requestData);
      
      toast.success("Service request created! Waiting for workers to respond");
      navigate(`/service-bids/${response.id}`);
    } catch (error) {
      console.error("Error creating service request:", error);
      toast.error("Failed to create service request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Request Quick Service</CardTitle>
            <CardDescription>
              Find skilled workers nearby for your immediate needs
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Location Section */}
              <div className="space-y-2">
                <Label>Your Location</Label>
                <div className="flex items-center p-3 border rounded-md bg-muted/50">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  {isLocationLoading ? (
                    <div className="flex items-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Getting your location...
                    </div>
                  ) : locationError ? (
                    <div className="flex items-center text-destructive">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {locationError}
                    </div>
                  ) : (
                    <span className="text-sm">
                      {locationName || "Location detected"}
                    </span>
                  )}
                </div>
                {location && (
                  <p className="text-xs text-muted-foreground">
                    Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select 
                  value={serviceType} 
                  onValueChange={setServiceType}
                >
                  <SelectTrigger id="serviceType">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Describe what you need</Label>
                <Textarea
                  id="description"
                  placeholder="E.g., I need an electrician to fix a power outlet that stopped working"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget">Maximum Budget (optional)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Enter maximum amount"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isLocationLoading || !location}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Request...
                  </>
                ) : (
                  "Request Service Now"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex-col space-y-2">
            <p className="text-xs text-muted-foreground">
              By submitting this request, nearby workers will be notified and able to send you quotes in real-time.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RequestService; 