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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Pencil, User, Building, Briefcase, Languages, FileVideo, X } from "lucide-react";
import { getWorkerProfileById, updateWorkerProfile, getProfileById } from "@/lib/localStorage";

const JOB_CATEGORIES = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "AC Technician",
  "Construction",
  "Cleaning",
  "Gardening",
];

const WorkerProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [basicProfile, setBasicProfile] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    skills: [] as string[],
    experience_years: 0,
    job_interests: [] as string[],
    qualification: "",
    availability: true,
    is_quick_job_active: false,
    languages: [] as string[],
    about_me: "",
    video_resume_url: "",
    portfolio_links: [] as string[],
    certifications: [] as string[],
    preferred_job_type: "",
    preferred_location: "",
    preferred_salary_range: { min: 0, max: 0 }
  });

  // Handle input for new portfolio link or certification
  const [newPortfolioLink, setNewPortfolioLink] = useState("");
  const [newCertification, setNewCertification] = useState("");

  // Redirect if not authenticated or not a worker
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your profile");
      navigate("/login");
      return;
    }

    if (user?.role !== "worker") {
      toast.error("This profile is for workers only");
      navigate("/");
      return;
    }

    // Fetch worker profile data
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const workerProfile = getWorkerProfileById(user._id);
        const basicUserProfile = getProfileById(user._id);

        if (workerProfile) {
          setProfileData(workerProfile);
          setFormData({
            skills: workerProfile.skills || [],
            experience_years: workerProfile.experience_years || 0,
            job_interests: workerProfile.job_interests || [],
            qualification: workerProfile.qualification || "",
            availability: workerProfile.availability !== false,
            is_quick_job_active: workerProfile.is_quick_job_active || false,
            languages: workerProfile.languages || [],
            about_me: workerProfile.about_me || "",
            video_resume_url: workerProfile.video_resume_url || "",
            portfolio_links: workerProfile.portfolio_links || [],
            certifications: workerProfile.certifications || [],
            preferred_job_type: workerProfile.preferred_job_type || "",
            preferred_location: workerProfile.preferred_location || "",
            preferred_salary_range: workerProfile.preferred_salary_range || { min: 0, max: 0 }
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

  const handleSkillToggle = (skill: string) => {
    const updatedSkills = [...formData.skills];
    if (updatedSkills.includes(skill)) {
      handleInputChange('skills', updatedSkills.filter(s => s !== skill));
    } else {
      handleInputChange('skills', [...updatedSkills, skill]);
    }
  };

  const handleJobInterestToggle = (interest: string) => {
    const updatedInterests = [...formData.job_interests];
    if (updatedInterests.includes(interest)) {
      handleInputChange('job_interests', updatedInterests.filter(i => i !== interest));
    } else {
      handleInputChange('job_interests', [...updatedInterests, interest]);
    }
  };

  const handleAddPortfolioLink = () => {
    if (!newPortfolioLink) return;
    
    if (!newPortfolioLink.startsWith("http://") && !newPortfolioLink.startsWith("https://")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    
    const updatedLinks = [...formData.portfolio_links, newPortfolioLink];
    handleInputChange('portfolio_links', updatedLinks);
    setNewPortfolioLink("");
  };

  const handleRemovePortfolioLink = (index: number) => {
    const updatedLinks = [...formData.portfolio_links];
    updatedLinks.splice(index, 1);
    handleInputChange('portfolio_links', updatedLinks);
  };

  const handleAddCertification = () => {
    if (!newCertification) return;
    
    const updatedCertifications = [...formData.certifications, newCertification];
    handleInputChange('certifications', updatedCertifications);
    setNewCertification("");
  };

  const handleRemoveCertification = (index: number) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications.splice(index, 1);
    handleInputChange('certifications', updatedCertifications);
  };

  const handleSalaryRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      preferred_salary_range: {
        ...prev.preferred_salary_range,
        [field]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validation
    if (formData.skills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }

    if (!formData.qualification) {
      toast.error("Please add your qualification");
      return;
    }

    try {
      const updatedProfile = updateWorkerProfile(user._id, formData);
      if (updatedProfile) {
        setProfileData(updatedProfile);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
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
            <CardTitle className="text-2xl">Profile Not Found</CardTitle>
            <CardDescription>
              We couldn't find your worker profile. Please complete your profile setup.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsEditing(true)}>Create Profile</Button>
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
            <AvatarImage src="" />
            <AvatarFallback className="text-2xl">
              {user?.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {skill}
                </span>
              ))}
              {formData.skills.length > 3 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  +{formData.skills.length - 3} more
                </span>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {isEditing ? (
          /* Edit Profile Form */
          <Card>
            <CardHeader>
              <CardTitle>Edit Your Profile</CardTitle>
              <CardDescription>
                Update your skills and preferences to help find the right job matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skills Section */}
              <div className="space-y-2">
                <Label className="text-base">Professional Skills</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {JOB_CATEGORIES.map((skill) => (
                    <div 
                      key={skill}
                      className={`p-2 border rounded-md cursor-pointer transition-colors ${
                        formData.skills.includes(skill) 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Experience & Qualifications */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Select
                    value={formData.experience_years.toString()}
                    onValueChange={(value) => handleInputChange('experience_years', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select years of experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year === 0 ? 'Less than 1 year' : `${year} year${year !== 1 ? 's' : ''}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    placeholder="e.g., ITI Electrical, High School Diploma"
                    value={formData.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                  />
                </div>
              </div>

              {/* Job Interests */}
              <div className="space-y-2">
                <Label className="text-base">Job Interests</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {JOB_CATEGORIES.map((interest) => (
                    <div 
                      key={interest}
                      className={`p-2 border rounded-md cursor-pointer transition-colors ${
                        formData.job_interests.includes(interest) 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleJobInterestToggle(interest)}
                    >
                      {interest}
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Skills */}
              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  placeholder="e.g., English, Hindi, Kannada (comma separated)"
                  value={formData.languages.join(', ')}
                  onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(l => l.trim()).filter(Boolean))}
                />
              </div>

              {/* About Me */}
              <div className="space-y-2">
                <Label htmlFor="about_me">About Me</Label>
                <Textarea
                  id="about_me"
                  placeholder="Briefly describe yourself and your work experience"
                  value={formData.about_me}
                  onChange={(e) => handleInputChange('about_me', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Job Preferences */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">Job Preferences</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_job_type">Preferred Job Type</Label>
                    <Select
                      value={formData.preferred_job_type}
                      onValueChange={(value) => handleInputChange('preferred_job_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="any">Any type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preferred_location">Preferred Location</Label>
                    <Input
                      id="preferred_location"
                      placeholder="e.g., Bangalore, Mumbai"
                      value={formData.preferred_location}
                      onChange={(e) => handleInputChange('preferred_location', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Salary Expectation (₹)</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="min_salary" className="text-xs text-muted-foreground">Minimum</Label>
                      <Input
                        id="min_salary"
                        type="number"
                        placeholder="Minimum"
                        value={formData.preferred_salary_range.min || ""}
                        onChange={(e) => handleSalaryRangeChange('min', e.target.value)}
                      />
                    </div>
                    <span className="text-muted-foreground">to</span>
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="max_salary" className="text-xs text-muted-foreground">Maximum</Label>
                      <Input
                        id="max_salary"
                        type="number"
                        placeholder="Maximum"
                        value={formData.preferred_salary_range.max || ""}
                        onChange={(e) => handleSalaryRangeChange('max', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Links */}
              <div className="space-y-3">
                <Label>Portfolio/Work Sample Links</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://example.com/portfolio" 
                    value={newPortfolioLink}
                    onChange={(e) => setNewPortfolioLink(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddPortfolioLink} className="whitespace-nowrap">
                    Add Link
                  </Button>
                </div>
                
                <div className="space-y-2 mt-2">
                  {formData.portfolio_links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        {link}
                      </a>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemovePortfolioLink(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <Label>Certifications & Training</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="ITI Certification in Electrical" 
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddCertification} className="whitespace-nowrap">
                    Add Certification
                  </Button>
                </div>
                
                <div className="space-y-2 mt-2">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <span className="truncate">{cert}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveCertification(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Resume URL */}
              <div className="space-y-2">
                <Label htmlFor="video_resume_url">Video Resume URL (optional)</Label>
                <Input
                  id="video_resume_url"
                  placeholder="e.g., https://youtube.com/your-video"
                  value={formData.video_resume_url}
                  onChange={(e) => handleInputChange('video_resume_url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Add a link to a short video about yourself and your work experience
                </p>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="availability" className="cursor-pointer">
                    I am currently available for work
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="quick_jobs"
                    checked={formData.is_quick_job_active}
                    onChange={(e) => handleInputChange('is_quick_job_active', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="quick_jobs" className="cursor-pointer">
                    I am interested in quick service jobs
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Changes</Button>
            </CardFooter>
          </Card>
        ) : (
          /* Profile View */
          <div className="space-y-6">
            {/* About Me */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {profileData.about_me || "No information provided"}
                </p>
              </CardContent>
            </Card>

            {/* Skills & Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Skills & Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Professional Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Experience</h3>
                    <p className="text-muted-foreground">
                      {profileData.experience_years === 0 
                        ? "Less than 1 year of experience" 
                        : `${profileData.experience_years} year${profileData.experience_years !== 1 ? 's' : ''} of experience`
                      }
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Qualification</h3>
                    <p className="text-muted-foreground">{profileData.qualification}</p>
                  </div>
                </div>

                {profileData.certifications && profileData.certifications.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Certifications & Training</h3>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {profileData.certifications.map((cert: string, i: number) => (
                        <li key={i}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio & Work Samples */}
            {profileData.portfolio_links && profileData.portfolio_links.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio & Work Samples</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profileData.portfolio_links.map((link: string, i: number) => (
                      <a 
                        key={i} 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block p-3 border rounded-md hover:bg-muted transition-colors text-blue-600"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Resume */}
            {profileData.video_resume_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileVideo className="h-5 w-5 mr-2" />
                    Video Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={profileData.video_resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FileVideo className="h-4 w-4 mr-2" />
                    View my video resume
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {profileData.languages && profileData.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Languages className="h-5 w-5 mr-2" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.languages.map((lang: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-muted text-sm rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Job Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {profileData.preferred_job_type && (
                    <div>
                      <h3 className="font-medium mb-1">Preferred Job Type</h3>
                      <p className="text-muted-foreground capitalize">{profileData.preferred_job_type}</p>
                    </div>
                  )}
                  
                  {profileData.preferred_location && (
                    <div>
                      <h3 className="font-medium mb-1">Preferred Location</h3>
                      <p className="text-muted-foreground">{profileData.preferred_location}</p>
                    </div>
                  )}
                </div>
                
                {profileData.preferred_salary_range && (profileData.preferred_salary_range.min > 0 || profileData.preferred_salary_range.max > 0) && (
                  <div>
                    <h3 className="font-medium mb-1">Salary Expectation</h3>
                    <p className="text-muted-foreground">
                      {profileData.preferred_salary_range.min > 0 && profileData.preferred_salary_range.max > 0
                        ? `₹${profileData.preferred_salary_range.min.toLocaleString()} - ₹${profileData.preferred_salary_range.max.toLocaleString()} per month`
                        : profileData.preferred_salary_range.min > 0
                          ? `From ₹${profileData.preferred_salary_range.min.toLocaleString()} per month`
                          : `Up to ₹${profileData.preferred_salary_range.max.toLocaleString()} per month`
                      }
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${profileData.availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{profileData.availability ? 'Available for work' : 'Not available for work'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${profileData.is_quick_job_active ? 'bg-green-500' : 'bg-muted'}`}></div>
                    <span>{profileData.is_quick_job_active ? 'Interested in quick services' : 'Not interested in quick services'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerProfile; 