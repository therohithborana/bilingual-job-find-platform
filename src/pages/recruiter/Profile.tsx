import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Pencil, Building, MapPin, Phone, Mail, Globe, X } from "lucide-react";
import { getRecruiterProfileById, updateRecruiterProfile, getProfileById } from "@/lib/localStorage";

const COMPANY_TYPES = [
  "Agency",
  "Construction Company",
  "Facility Management",
  "Service Provider",
  "Maintenance Company",
  "Individual Employer",
  "Other"
];

const INDUSTRIES = [
  "Construction",
  "Maintenance",
  "Real Estate",
  "Hospitality",
  "Manufacturing",
  "Other"
];

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501+ employees"
];

const RecruiterProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [basicProfile, setBasicProfile] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    company_name: "",
    company_type: "",
    industry: "",
    about: "",
    company_size: "",
    founded_year: "",
    company_website: "",
    company_logo_url: "",
    social_media: {
      linkedin: "",
      twitter: "",
      facebook: ""
    },
    office_locations: [] as string[],
    benefits_offered: [] as string[],
    contact_email: "",
    contact_phone: ""
  });

  // Handle input for new location or benefit
  const [newLocation, setNewLocation] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  // Redirect if not authenticated or not a recruiter
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your profile");
      navigate("/login");
      return;
    }

    if (user?.role !== "recruiter") {
      toast.error("This profile is for recruiters only");
      navigate("/");
      return;
    }

    // Fetch recruiter profile data
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const recruiterProfile = getRecruiterProfileById(user._id);
        const basicUserProfile = getProfileById(user._id);

        if (recruiterProfile) {
          setProfileData(recruiterProfile);
          setFormData({
            company_name: recruiterProfile.company_name || "",
            company_type: recruiterProfile.company_type || "",
            industry: recruiterProfile.industry || "",
            about: recruiterProfile.about || "",
            company_size: recruiterProfile.company_size || "",
            founded_year: recruiterProfile.founded_year?.toString() || "",
            company_website: recruiterProfile.company_website || "",
            company_logo_url: recruiterProfile.company_logo_url || "",
            social_media: recruiterProfile.social_media || {
              linkedin: "",
              twitter: "",
              facebook: ""
            },
            office_locations: recruiterProfile.office_locations || [],
            benefits_offered: recruiterProfile.benefits_offered || [],
            contact_email: recruiterProfile.contact_email || "",
            contact_phone: recruiterProfile.contact_phone || ""
          });
        }

        if (basicUserProfile) {
          setBasicProfile(basicUserProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate, user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
  };

  const handleAddLocation = () => {
    if (!newLocation) return;
    
    const updatedLocations = [...formData.office_locations, newLocation];
    handleInputChange('office_locations', updatedLocations);
    setNewLocation("");
  };

  const handleRemoveLocation = (index: number) => {
    const updatedLocations = [...formData.office_locations];
    updatedLocations.splice(index, 1);
    handleInputChange('office_locations', updatedLocations);
  };

  const handleAddBenefit = () => {
    if (!newBenefit) return;
    
    const updatedBenefits = [...formData.benefits_offered, newBenefit];
    handleInputChange('benefits_offered', updatedBenefits);
    setNewBenefit("");
  };

  const handleRemoveBenefit = (index: number) => {
    const updatedBenefits = [...formData.benefits_offered];
    updatedBenefits.splice(index, 1);
    handleInputChange('benefits_offered', updatedBenefits);
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validation
    if (!formData.company_name || !formData.company_type || !formData.industry) {
      toast.error("Please fill in all required company information");
      return;
    }

    if (!formData.contact_email) {
      toast.error("Please provide a contact email");
      return;
    }

    try {
      const updatedProfile = updateRecruiterProfile(user._id, formData);
      if (updatedProfile) {
        setProfileData(updatedProfile);
        setIsEditing(false);
        toast.success("Company profile updated successfully");
      } else {
        toast.error("Failed to update company profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profileData && !isLoading) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Company Profile Not Found</CardTitle>
            <CardDescription>
              We couldn't find your company profile. Please complete your company profile setup.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsEditing(true)}>Create Company Profile</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8 flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="h-24 w-24">
            {profileData.company_logo_url ? (
              <AvatarImage src={profileData.company_logo_url} alt={profileData.company_name} />
            ) : (
              <AvatarFallback className="text-2xl">
                <Building className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profileData.company_name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 text-muted-foreground">
              {profileData.company_type && (
                <span className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-1" />
                  {profileData.company_type}
                </span>
              )}
              {profileData.industry && (
                <span className="flex items-center text-sm">
                  {profileData.industry}
                </span>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Company Profile
              </Button>
            </div>
          </div>
        </div>

        {isEditing ? (
          /* Edit Company Profile Form */
          <Card>
            <CardHeader>
              <CardTitle>Edit Company Profile</CardTitle>
              <CardDescription>
                Update your company information to attract qualified candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Company Information */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company_type">Company Type</Label>
                    <Select
                      value={formData.company_type}
                      onValueChange={(value) => handleInputChange('company_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company type" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleInputChange('industry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select
                      value={formData.company_size}
                      onValueChange={(value) => handleInputChange('company_size', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="founded_year">Year Founded</Label>
                    <Input
                      id="founded_year"
                      type="number"
                      placeholder="e.g., 2010"
                      value={formData.founded_year}
                      onChange={(e) => handleInputChange('founded_year', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* About Company */}
              <div className="space-y-2">
                <Label htmlFor="about">About Company</Label>
                <Textarea
                  id="about"
                  placeholder="Briefly describe your company, its mission, and values"
                  value={formData.about}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">Contact Information</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="e.g., jobs@yourcompany.com"
                      value={formData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone (optional)</Label>
                    <Input
                      id="contact_phone"
                      placeholder="e.g., +91 9876543210"
                      value={formData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Online Presence */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">Online Presence</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="company_website">Company Website</Label>
                  <Input
                    id="company_website"
                    placeholder="e.g., https://yourcompany.com"
                    value={formData.company_website}
                    onChange={(e) => handleInputChange('company_website', e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      placeholder="LinkedIn URL"
                      value={formData.social_media.linkedin}
                      onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <Input
                      id="twitter"
                      placeholder="Twitter/X URL"
                      value={formData.social_media.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      placeholder="Facebook URL"
                      value={formData.social_media.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Company Logo */}
              <div className="space-y-2">
                <Label htmlFor="company_logo_url">Company Logo URL (optional)</Label>
                <Input
                  id="company_logo_url"
                  placeholder="e.g., https://yourcompany.com/logo.png"
                  value={formData.company_logo_url}
                  onChange={(e) => handleInputChange('company_logo_url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL for your company logo (300x300px recommended)
                </p>
              </div>

              {/* Office Locations */}
              <div className="space-y-3">
                <Label>Office Locations</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., Bangalore" 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddLocation} className="whitespace-nowrap">
                    Add Location
                  </Button>
                </div>
                
                <div className="space-y-2 mt-2">
                  {formData.office_locations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {location}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveLocation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits Offered */}
              <div className="space-y-3">
                <Label>Benefits Offered</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., Health Insurance" 
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddBenefit} className="whitespace-nowrap">
                    Add Benefit
                  </Button>
                </div>
                
                <div className="space-y-2 mt-2">
                  {formData.benefits_offered.map((benefit, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <span>{benefit}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveBenefit(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Changes</Button>
            </CardFooter>
          </Card>
        ) : (
          /* Company Profile View */
          <div className="space-y-6">
            {/* About Company */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  About {profileData.company_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {profileData.about || "No company description provided"}
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  {profileData.company_size && (
                    <div>
                      <h3 className="font-medium text-sm mb-1">Company Size</h3>
                      <p className="text-muted-foreground">{profileData.company_size}</p>
                    </div>
                  )}
                  
                  {profileData.founded_year && (
                    <div>
                      <h3 className="font-medium text-sm mb-1">Founded</h3>
                      <p className="text-muted-foreground">{profileData.founded_year}</p>
                    </div>
                  )}
                  
                  {profileData.industry && (
                    <div>
                      <h3 className="font-medium text-sm mb-1">Industry</h3>
                      <p className="text-muted-foreground">{profileData.industry}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
                  {profileData.contact_email && (
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium text-sm">Email</h3>
                        <a href={`mailto:${profileData.contact_email}`} className="text-primary hover:underline">
                          {profileData.contact_email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {profileData.contact_phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium text-sm">Phone</h3>
                        <a href={`tel:${profileData.contact_phone}`} className="text-primary hover:underline">
                          {profileData.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {profileData.company_website && (
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium text-sm">Website</h3>
                        <a 
                          href={profileData.company_website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline"
                        >
                          {profileData.company_website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Social Media */}
                {(profileData.social_media?.linkedin || profileData.social_media?.twitter || profileData.social_media?.facebook) && (
                  <div className="pt-2">
                    <h3 className="font-medium text-sm mb-2">Social Media</h3>
                    <div className="flex gap-3">
                      {profileData.social_media?.linkedin && (
                        <a 
                          href={profileData.social_media.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                      
                      {profileData.social_media?.twitter && (
                        <a 
                          href={profileData.social_media.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Twitter/X
                        </a>
                      )}
                      
                      {profileData.social_media?.facebook && (
                        <a 
                          href={profileData.social_media.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Office Locations */}
            {profileData.office_locations && profileData.office_locations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Office Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {profileData.office_locations.map((location: string, i: number) => (
                      <div key={i} className="p-3 border rounded-md">
                        {location}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {profileData.benefits_offered && profileData.benefits_offered.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {profileData.benefits_offered.map((benefit: string, i: number) => (
                      <div key={i} className="flex items-center">
                        <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterProfile; 