
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SERVICES, MOCK_LOCATIONS, MOCK_WORKERS } from "@/lib/models";
import { toast } from "sonner";

const QuickJobs = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: "",
    serviceType: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRequest, setActiveRequest] = useState<{
    requestId: string;
    serviceType: string;
    worker?: typeof MOCK_WORKERS[0];
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Create a "request"
      const requestId = Math.random().toString(36).substring(2, 15);
      setActiveRequest({
        requestId,
        serviceType: formData.serviceType,
      });
      
      toast.success("Service request submitted! Looking for available workers...");
      setStep(2);
      
      // Simulate finding a worker after 3 seconds
      setTimeout(() => {
        const availableWorker = MOCK_WORKERS.find(w => w.isQuickJobActive);
        
        if (availableWorker) {
          setActiveRequest(prev => ({
            ...prev!,
            worker: availableWorker
          }));
          toast.success(`Worker ${availableWorker.name} accepted your request!`);
          setStep(3);
        } else {
          toast.error("No workers available at the moment. Please try again later.");
          setStep(1);
          setActiveRequest(null);
        }
      }, 3000);
      
    } catch (error) {
      toast.error("Failed to submit service request. Please try again.");
      console.error("Error submitting service request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateHappyCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    toast.success(`Happy Code: ${code}`);
    return code;
  };

  const handleComplete = () => {
    toast.success("Service completed successfully!");
    setActiveRequest(null);
    setStep(1);
    setFormData({
      customerName: "",
      serviceType: "",
      location: "",
    });
  };

  const handleCancel = () => {
    toast.info("Service request cancelled");
    setActiveRequest(null);
    setStep(1);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-bluehire-800 mb-8">
        {t("navigation.quickJobs")}
      </h1>
      
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Request Quick Service</CardTitle>
            <CardDescription>
              Find skilled workers for urgent services in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                  {t("quickJobs.serviceType")}
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bluehire-500 focus:border-transparent"
                  required
                >
                  <option value="">Select service</option>
                  {MOCK_SERVICES.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.icon} {service.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  {t("quickJobs.yourLocation")}
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bluehire-500 focus:border-transparent"
                  required
                >
                  <option value="">Select location</option>
                  {MOCK_LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : t("quickJobs.findFix")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Finding Workers</CardTitle>
            <CardDescription>
              Looking for available {activeRequest?.serviceType} workers in {formData.location}...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bluehire-600"></div>
            </div>
            <p className="text-gray-500">
              This won't take long. We're connecting you with nearby verified professionals.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleCancel}>
              Cancel Request
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {step === 3 && activeRequest?.worker && (
        <Card>
          <CardHeader>
            <CardTitle>{t("quickJobs.accepted")}</CardTitle>
            <CardDescription>
              A worker has accepted your service request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <div className="h-20 w-20 rounded-full bg-bluehire-100 flex items-center justify-center text-bluehire-800 text-3xl font-semibold mb-4">
                {activeRequest.worker.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold">{activeRequest.worker.name}</h3>
              <p className="text-gray-500 mb-2">{activeRequest.serviceType}</p>
              <div className="flex items-center text-yellow-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-6">
                <h4 className="font-medium mb-2">Contact</h4>
                <p className="text-gray-600">
                  Experience: {activeRequest.worker.experienceYears} years
                </p>
                <p className="text-gray-600">
                  Languages: {activeRequest.worker.languages.join(", ")}
                </p>
              </div>
              
              {/* Chat mockup */}
              <div className="border border-gray-200 rounded-lg p-3 h-36 mb-4 bg-gray-50 overflow-y-scroll">
                <p className="text-center text-gray-500 text-sm">
                  Chat functionality would appear here in a real implementation
                </p>
              </div>
            </div>
            
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <Button 
                className="w-full" 
                onClick={() => {
                  const code = generateHappyCode();
                }}
              >
                {t("quickJobs.generateCode")}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button onClick={handleComplete} className="w-full">
              {t("quickJobs.complete")}
            </Button>
            <Button variant="outline" onClick={handleCancel} className="w-full">
              Cancel Service
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default QuickJobs;
