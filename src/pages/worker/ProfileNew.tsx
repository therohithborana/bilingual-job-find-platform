
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MOCK_LOCATIONS } from "@/lib/models";

const ProfileNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    location: "",
    skills: "",
    experienceYears: "",
    jobInterests: "",
    qualification: "",
    availability: true,
    videoResume: null as File | null,
    isQuickJobActive: true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, videoResume: e.target.files![0] }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, you'd upload the file to Cloudinary and send form data to your API
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Profile created successfully!");
      navigate("/worker/profile");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-bluehire-800">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Fill in your profile details to start finding job opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Electrical wiring, Plumbing, AC repair (comma separated)"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Experience (Years)</Label>
              <Input
                id="experienceYears"
                name="experienceYears"
                type="number"
                min="0"
                max="50"
                value={formData.experienceYears}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobInterests">Job Interests</Label>
              <Textarea
                id="jobInterests"
                name="jobInterests"
                value={formData.jobInterests}
                onChange={handleChange}
                placeholder="Types of jobs you're interested in (comma separated)"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g. ITI Electrical, 10th standard, Diploma"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="availability">Availability</Label>
              <Switch
                id="availability"
                checked={formData.availability}
                onCheckedChange={(checked) => handleSwitchChange("availability", checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoResume">Video Resume</Label>
              <Input
                id="videoResume"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
              />
              <p className="text-sm text-gray-500">
                Upload a short 30-second video about yourself and your skills
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isQuickJobActive">Quick Jobs</Label>
              <Switch
                id="isQuickJobActive"
                checked={formData.isQuickJobActive}
                onCheckedChange={(checked) => handleSwitchChange("isQuickJobActive", checked)}
              />
            </div>
            
            <div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileNew;
