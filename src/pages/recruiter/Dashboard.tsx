import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, PenSquare, Trash2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { JobPost } from "@/lib/supabase-types";
import { JobType } from "@/lib/supabase-types";
import {
  getJobPostsByRecruiterId,
  createJobPost,
  updateJobPost,
  deleteJobPost,
  getJobApplicationsForJob,
  updateJobApplication,
  getJobApplications,
  getJobPosts,
  createRecruiterProfile,
  getRecruiterProfileById
} from "@/lib/localStorage";

// MOCK CATEGORIES - replace with real data from API later
const JOB_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Carpentry",
  "Construction",
  "HVAC",
  "Painting",
  "Gardening",
  "Driving",
  "Other"
];

// MOCK LOCATIONS - replace with real data from API later
const LOCATIONS = [
  "Bangalore",
  "Mysore",
  "Hubli",
  "Mangalore",
  "Belgaum",
  "Gulbarga",
  "Bellary",
  "Davanagere"
];

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobPost | null>(null);
  
  // Form states for creating/editing jobs
  const [jobTitle, setJobTitle] = useState("");
  const [jobType, setJobType] = useState<JobType>("full-time");
  const [jobCategory, setJobCategory] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState<number>(0);
  const [salaryMax, setSalaryMax] = useState<number>(0);
  const [expRequired, setExpRequired] = useState<number>(0);
  const [qualification, setQualification] = useState("");
  const [description, setDescription] = useState("");

  // Fetch job posts
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Get or create a recruiter profile for the current user
        const userId = user._id;
        let recruiterProfile = getRecruiterProfileById(userId);
        
        if (!recruiterProfile) {
          // Create a recruiter profile if it doesn't exist
          recruiterProfile = createRecruiterProfile({
            id: userId,
            company_name: user.name || 'Development Company',
            company_type: 'Development',
            industry: 'Technology',
            about: 'Auto-created profile for development',
            contact_email: user.email,
            contact_phone: '',
            is_approved: true
          });
        }
        
        // Get job posts for this recruiter
        const jobs = getJobPostsByRecruiterId(userId);
        setJobPosts(jobs);
        
        // Get applications for all jobs
        if (jobs.length > 0) {
          const jobIds = jobs.map(job => job.id);
          const allApplications = getJobApplications();
          const filteredApplications = allApplications.filter(app => jobIds.includes(app.job_id));
          
          // Add job details to applications
          const allJobs = getJobPosts();
          
          const applicationsWithDetails = filteredApplications.map(app => {
            const job = allJobs.find(j => j.id === app.job_id);
            return {
              ...app,
              job: job || {},
              worker: {
                profile: {
                  name: 'Worker', // Simplified for the example
                },
                experience_years: 2
              }
            };
          });
          
          setApplications(applicationsWithDetails);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs. Using development data.");
        // Default to empty arrays if there's an error
        setJobPosts([]);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobs();
  }, [user]);

  // Reset form for creating new job
  const resetJobForm = () => {
    setJobTitle("");
    setJobType("full-time");
    setJobCategory("");
    setJobLocation("");
    setSalaryMin(0);
    setSalaryMax(0);
    setExpRequired(0);
    setQualification("");
    setDescription("");
    setCurrentJob(null);
  };

  // Prepare form for editing job
  const prepareEditJob = (job: JobPost) => {
    setCurrentJob(job);
    setJobTitle(job.title);
    setJobType(job.type);
    setJobCategory(job.category);
    setJobLocation(job.location);
    setSalaryMin(job.salary_min);
    setSalaryMax(job.salary_max);
    setExpRequired(job.experience_required);
    setQualification(job.qualification || "");
    setDescription(job.description);
    setIsEditingJob(true);
  };

  // Create job post
  const handleCreateJob = async () => {
    if (!user) {
      toast.error("You need to be logged in to create a job post");
      return;
    }
    
    try {
      const newJob = createJobPost({
        recruiter_id: user._id,
        title: jobTitle,
        type: jobType,
        category: jobCategory,
        location: jobLocation,
        salary_min: salaryMin,
        salary_max: salaryMax,
        experience_required: expRequired,
        qualification: qualification || null,
        description: description
      });
      
      setJobPosts(prev => [newJob, ...prev]);
      resetJobForm();
      setIsCreatingJob(false);
      toast.success("Job post created successfully!");
    } catch (error) {
      console.error("Error creating job post:", error);
      toast.error("Failed to create job post");
    }
  };

  // Update job post
  const handleUpdateJob = async () => {
    if (!user || !currentJob) return;
    
    try {
      const updatedData = {
        title: jobTitle,
        type: jobType,
        category: jobCategory,
        location: jobLocation,
        salary_min: salaryMin,
        salary_max: salaryMax,
        experience_required: expRequired,
        qualification: qualification || null,
        description: description
      };
      
      const updatedJob = updateJobPost(currentJob.id, updatedData);
      
      if (updatedJob) {
        setJobPosts(prev => prev.map(job => 
          job.id === currentJob.id ? updatedJob : job
        ));
      }
      
      resetJobForm();
      setIsEditingJob(false);
      toast.success("Job post updated successfully!");
    } catch (error) {
      console.error("Error updating job post:", error);
      toast.error("Failed to update job post");
    }
  };

  // Delete job post
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job post?")) return;
    
    try {
      const success = deleteJobPost(jobId);
      
      if (success) {
        setJobPosts(prev => prev.filter(job => job.id !== jobId));
        toast.success("Job post deleted successfully!");
      } else {
        toast.error("Failed to delete job post");
      }
    } catch (error) {
      console.error("Error deleting job post:", error);
      toast.error("Failed to delete job post");
    }
  };

  // Update application status
  const handleUpdateApplicationStatus = (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const updatedApp = updateJobApplication(applicationId, { status });
      
      if (updatedApp) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        ));
        
        toast.success(`Application ${status}`);
      } else {
        toast.error(`Failed to ${status} application`);
      }
    } catch (error) {
      console.error(`Error ${status} application:`, error);
      toast.error(`Failed to ${status} application`);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Job Management Dashboard</h1>
        <Button onClick={() => { resetJobForm(); setIsCreatingJob(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Post New Job
        </Button>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs">My Job Posts</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-6">
          {jobPosts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Jobs Posted Yet</CardTitle>
                <CardDescription>
                  Start posting jobs to find qualified workers for your projects.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => { resetJobForm(); setIsCreatingJob(true); }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Job Post
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobPosts.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{job.type}</span>
                      <span className="text-sm bg-gray-100 text-gray-800 px-2 py-0.5 rounded">{job.category}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="flex justify-between mb-2">
                      <span>Location:</span>
                      <span className="font-medium">{job.location}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Salary Range:</span>
                      <span className="font-medium">₹{job.salary_min} - ₹{job.salary_max}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span className="font-medium">{job.experience_required} years</span>
                    </div>
                    <p className="mt-4 line-clamp-3">{job.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0 border-t">
                    <Button variant="outline" size="sm" onClick={() => prepareEditJob(job)}>
                      <PenSquare className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          {applications.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Applications Yet</CardTitle>
                <CardDescription>
                  Once workers apply to your jobs, you'll see them listed here.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">{application.job.title}</CardTitle>
                    <CardDescription>
                      Applied on {new Date(application.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{application.worker?.profile?.name || "Worker"}</p>
                        <p className="text-sm text-gray-500">{application.worker?.experience_years || 0} years experience</p>
                      </div>
                    </div>
                    
                    {application.cover_note && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Cover Note:</p>
                        <p className="text-sm italic mt-1">{application.cover_note}</p>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium">Status:</p>
                      <div className={`mt-1 text-sm px-2 py-1 rounded inline-block ${
                        application.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        application.status === "accepted" ? "bg-green-100 text-green-800" :
                        application.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      disabled={application.status === "rejected"}
                      onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      disabled={application.status === "accepted"}
                      onClick={() => handleUpdateApplicationStatus(application.id, 'accepted')}
                    >
                      Accept
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Job Dialog */}
      <Dialog open={isCreatingJob} onOpenChange={setIsCreatingJob}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Job Post</DialogTitle>
            <DialogDescription>
              Fill out the details below to create a new job posting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Electrician for Residential Project"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jobType">Job Type *</Label>
                <Select value={jobType} onValueChange={(value: JobType) => setJobType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jobCategory">Category *</Label>
                <Select value={jobCategory} onValueChange={setJobCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jobLocation">Location *</Label>
                <Select value={jobLocation} onValueChange={setJobLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expRequired">Experience Required (Years) *</Label>
                <Input
                  id="expRequired"
                  type="number"
                  min="0"
                  value={expRequired}
                  onChange={(e) => setExpRequired(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salaryMin">Minimum Salary (₹) *</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(parseInt(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salaryMax">Maximum Salary (₹) *</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. ITI, Diploma, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the job responsibilities, requirements, etc."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingJob(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleCreateJob} disabled={
              !jobTitle || !jobType || !jobCategory || !jobLocation || 
              !description || salaryMin <= 0 || salaryMax <= 0 || salaryMin > salaryMax
            }>
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={isEditingJob} onOpenChange={setIsEditingJob}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Job Post</DialogTitle>
            <DialogDescription>
              Update the details of your job posting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Electrician for Residential Project"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jobType">Job Type *</Label>
                <Select value={jobType} onValueChange={(value: JobType) => setJobType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jobCategory">Category *</Label>
                <Select value={jobCategory} onValueChange={setJobCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jobLocation">Location *</Label>
                <Select value={jobLocation} onValueChange={setJobLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expRequired">Experience Required (Years) *</Label>
                <Input
                  id="expRequired"
                  type="number"
                  min="0"
                  value={expRequired}
                  onChange={(e) => setExpRequired(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salaryMin">Minimum Salary (₹) *</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(parseInt(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salaryMax">Maximum Salary (₹) *</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. ITI, Diploma, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the job responsibilities, requirements, etc."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingJob(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleUpdateJob} disabled={
              !jobTitle || !jobType || !jobCategory || !jobLocation || 
              !description || salaryMin <= 0 || salaryMax <= 0 || salaryMin > salaryMax
            }>
              Update Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 