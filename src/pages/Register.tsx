import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createWorkerProfile, createRecruiterProfile } from "@/lib/localStorage";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Basic information (Step 1)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"worker" | "recruiter">("worker");
  
  // Worker profile information (Step 2)
  const [workerProfile, setWorkerProfile] = useState({
    skills: [] as string[],
    experience_years: 0,
    job_interests: [] as string[],
    qualification: "",
    availability: true,
    is_quick_job_active: false,
    languages: [] as string[],
    about_me: ""
  });
  
  // Recruiter profile information (Step 2)
  const [recruiterProfile, setRecruiterProfile] = useState({
    company_name: "",
    company_type: "",
    industry: "",
    about: "",
    company_size: "",
    company_website: "",
    contact_email: "",
    contact_phone: "",
    office_locations: [] as string[],
    benefits_offered: [] as string[]
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleNextStep = () => {
    if (step === 1) {
      // Validation for step 1
      if (!name || !email || !password || !confirmPassword) {
        toast.error("Please fill in all fields");
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleWorkerProfileChange = (field: string, value: any) => {
    setWorkerProfile({
      ...workerProfile,
      [field]: value
    });
  };

  const handleRecruiterProfileChange = (field: string, value: any) => {
    setRecruiterProfile({
      ...recruiterProfile,
      [field]: value
    });
  };

  const handleSkillChange = (skill: string) => {
    const currentSkills = [...workerProfile.skills];
    if (currentSkills.includes(skill)) {
      handleWorkerProfileChange('skills', currentSkills.filter(s => s !== skill));
    } else {
      handleWorkerProfileChange('skills', [...currentSkills, skill]);
    }
  };

  const handleJobInterestChange = (interest: string) => {
    const currentInterests = [...workerProfile.job_interests];
    if (currentInterests.includes(interest)) {
      handleWorkerProfileChange('job_interests', currentInterests.filter(i => i !== interest));
    } else {
      handleWorkerProfileChange('job_interests', [...currentInterests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (role === "worker") {
      if (workerProfile.skills.length === 0) {
        toast.error("Please select at least one skill");
        return;
      }
      
      if (!workerProfile.qualification) {
        toast.error("Please provide your qualification");
        return;
      }
    } else {
      if (!recruiterProfile.company_name || !recruiterProfile.company_type || !recruiterProfile.industry) {
        toast.error("Please fill in all required company information");
        return;
      }
    }

    setIsLoading(true);
    try {
      // Register user account
      const user = await register(name, email, password, role);
      
      // Create profile based on role
      if (role === "worker") {
        createWorkerProfile({
          id: user._id,
          ...workerProfile
        });
      } else {
        createRecruiterProfile({
          id: user._id,
          ...recruiterProfile,
          is_approved: true // Auto-approve for localStorage version
        });
      }

      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      // Error messages are already shown via toast in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  // Create profile completion steps based on role
  const getStepsCount = () => {
    return 2;
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <div className="text-sm text-muted-foreground">
                Step {step} of {getStepsCount()}
              </div>
            </div>
            <CardDescription>
              {step === 1 
                ? "Register to find jobs or post work opportunities" 
                : role === "worker" 
                  ? "Tell us about your skills and experience"
                  : "Tell us about your company"
              }
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={step === getStepsCount() ? handleSubmit : (e) => e.preventDefault()}>
            <CardContent className="space-y-4">
              {step === 1 && (
                /* Basic Account Information */
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>I want to</Label>
                    <RadioGroup
                      value={role}
                      onValueChange={(value) => setRole(value as "worker" | "recruiter")}
                      className="flex flex-col gap-2 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="worker" id="worker" />
                        <Label htmlFor="worker" className="cursor-pointer">Find jobs (Worker)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="recruiter" id="recruiter" />
                        <Label htmlFor="recruiter" className="cursor-pointer">Post jobs (Recruiter)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              {step === 2 && role === "worker" && (
                /* Worker Profile Information */
                <>
                  <div className="space-y-2">
                    <Label>Your Skills</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {JOB_CATEGORIES.map((skill) => (
                        <div 
                          key={skill}
                          className={`p-2 border rounded-md cursor-pointer transition-colors ${
                            workerProfile.skills.includes(skill) 
                              ? 'bg-primary/10 border-primary' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => handleSkillChange(skill)}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select all the skills that apply to you
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Select
                      value={workerProfile.experience_years.toString()}
                      onValueChange={(value) => handleWorkerProfileChange('experience_years', parseInt(value))}
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
                      value={workerProfile.qualification}
                      onChange={(e) => handleWorkerProfileChange('qualification', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Job Interests</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {JOB_CATEGORIES.map((interest) => (
                        <div 
                          key={interest}
                          className={`p-2 border rounded-md cursor-pointer transition-colors ${
                            workerProfile.job_interests.includes(interest) 
                              ? 'bg-primary/10 border-primary' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => handleJobInterestChange(interest)}
                        >
                          {interest}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages (comma separated)</Label>
                    <Input
                      id="languages"
                      placeholder="e.g., English, Hindi, Kannada"
                      value={workerProfile.languages.join(', ')}
                      onChange={(e) => handleWorkerProfileChange('languages', e.target.value.split(',').map(l => l.trim()).filter(Boolean))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about_me">About Me</Label>
                    <Textarea
                      id="about_me"
                      placeholder="Briefly describe yourself and your work experience"
                      value={workerProfile.about_me}
                      onChange={(e) => handleWorkerProfileChange('about_me', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="availability"
                      checked={workerProfile.availability}
                      onChange={(e) => handleWorkerProfileChange('availability', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="availability" className="cursor-pointer">
                      I am available for work
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="quick_jobs"
                      checked={workerProfile.is_quick_job_active}
                      onChange={(e) => handleWorkerProfileChange('is_quick_job_active', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="quick_jobs" className="cursor-pointer">
                      I am interested in quick service jobs
                    </Label>
                  </div>
                </>
              )}

              {step === 2 && role === "recruiter" && (
                /* Recruiter Profile Information */
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      placeholder="e.g., ABC Construction Ltd."
                      value={recruiterProfile.company_name}
                      onChange={(e) => handleRecruiterProfileChange('company_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_type">Company Type</Label>
                    <Select
                      value={recruiterProfile.company_type}
                      onValueChange={(value) => handleRecruiterProfileChange('company_type', value)}
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
                      value={recruiterProfile.industry}
                      onValueChange={(value) => handleRecruiterProfileChange('industry', value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select
                      value={recruiterProfile.company_size}
                      onValueChange={(value) => handleRecruiterProfileChange('company_size', value)}
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
                    <Label htmlFor="company_website">Company Website (optional)</Label>
                    <Input
                      id="company_website"
                      placeholder="e.g., https://example.com"
                      value={recruiterProfile.company_website}
                      onChange={(e) => handleRecruiterProfileChange('company_website', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="e.g., jobs@yourcompany.com"
                      value={recruiterProfile.contact_email}
                      onChange={(e) => handleRecruiterProfileChange('contact_email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone (optional)</Label>
                    <Input
                      id="contact_phone"
                      placeholder="e.g., +91 9876543210"
                      value={recruiterProfile.contact_phone}
                      onChange={(e) => handleRecruiterProfileChange('contact_phone', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about">About Company</Label>
                    <Textarea
                      id="about"
                      placeholder="Briefly describe your company"
                      value={recruiterProfile.about}
                      onChange={(e) => handleRecruiterProfileChange('about', e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="office_locations">Office Locations (comma separated)</Label>
                    <Input
                      id="office_locations"
                      placeholder="e.g., Bangalore, Mumbai, Delhi"
                      value={recruiterProfile.office_locations.join(', ')}
                      onChange={(e) => handleRecruiterProfileChange('office_locations', e.target.value.split(',').map(l => l.trim()).filter(Boolean))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits_offered">Benefits Offered (comma separated)</Label>
                    <Input
                      id="benefits_offered"
                      placeholder="e.g., Health Insurance, PF, Weekly Offs"
                      value={recruiterProfile.benefits_offered.join(', ')}
                      onChange={(e) => handleRecruiterProfileChange('benefits_offered', e.target.value.split(',').map(b => b.trim()).filter(Boolean))}
                    />
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2">
              {step > 1 ? (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={isLoading}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div /> // Empty div to maintain space
              )}
              
              {step < getStepsCount() ? (
                <Button type="button" onClick={handleNextStep}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
          
          <Separator className="my-2" />
          
          <div className="p-6 pt-2 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
