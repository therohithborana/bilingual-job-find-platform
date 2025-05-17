import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getJobPosts, createJobApplication } from "@/lib/localStorage";
import { JobPost } from "@/lib/supabase-types";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Mock locations - could be fetched from an API in a real app
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

const Jobs = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [allJobs, setAllJobs] = useState<JobPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyingForJob, setIsApplyingForJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [coverNote, setCoverNote] = useState("");

  // Load jobs from localStorage
  useEffect(() => {
    try {
      const jobs = getJobPosts();
      setAllJobs(jobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get unique categories from jobs
  const categories = Array.from(new Set(allJobs.map(job => job.category)));
  
  // Filter jobs based on search criteria
  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesLocation = !location || job.location === location;
    const matchesCategory = !category || job.category === category;
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

  // Handle apply for job
  const handleApplyForJob = (job: JobPost) => {
    if (!isAuthenticated) {
      toast.error("Please log in to apply for jobs");
      navigate("/login", { state: { from: "/jobs" } });
      return;
    }

    // Check if user is in worker role
    if (user?.role !== 'worker') {
      toast.error("You need to be in worker mode to apply for jobs");
      return;
    }

    setSelectedJob(job);
    setCoverNote("");
    setIsApplyingForJob(true);
  };

  // Submit job application
  const submitApplication = () => {
    if (!user || !selectedJob) return;

    try {
      createJobApplication({
        job_id: selectedJob.id,
        worker_id: user._id,
        cover_note: coverNote || undefined
      });

      toast.success("Application submitted successfully!");
      setIsApplyingForJob(false);
      setCoverNote("");
      setSelectedJob(null);
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error((error as Error).message || "Failed to apply for job");
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Available Jobs</h1>
      
      {/* Search and filter section */}
      <div className="bg-card shadow-sm rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-1">
              Search jobs
            </label>
            <Input
              id="search"
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Location
            </label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 bg-background"
            >
              <option value="">All Locations</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 bg-background"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button 
              className="w-full" 
              onClick={() => {
                setSearchTerm("");
                setLocation("");
                setCategory("");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Jobs list */}
      <div className="grid grid-cols-1 gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onApply={handleApplyForJob} 
              isAuthenticated={isAuthenticated}
              userRole={user?.role}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">No jobs found matching your criteria</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchTerm("");
              setLocation("");
              setCategory("");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Apply for Job Dialog */}
      <Dialog open={isApplyingForJob} onOpenChange={setIsApplyingForJob}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for Job</DialogTitle>
            <DialogDescription>
              {selectedJob && `You are applying for: ${selectedJob.title}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="coverNote">Cover Note (Optional)</Label>
              <Textarea
                id="coverNote"
                placeholder="Briefly describe why you're a good fit for this position..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyingForJob(false)}>
              Cancel
            </Button>
            <Button onClick={submitApplication}>
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const JobCard = ({ 
  job, 
  onApply,
  isAuthenticated,
  userRole
}: { 
  job: JobPost; 
  onApply: (job: JobPost) => void;
  isAuthenticated: boolean;
  userRole?: string;
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="md:flex justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">{job.title}</h2>
            <div className="space-y-2">
              <div className="flex items-center text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>{job.category}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>₹{job.salary_min.toLocaleString()} - ₹{job.salary_max.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 md:text-right flex flex-col items-start md:items-end justify-between">
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {job.type}
              </span>
              <div className="mt-2 text-muted-foreground text-sm">
                <span>Experience: {job.experience_required}+ years</span>
              </div>
              <div className="text-muted-foreground text-sm">
                <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <Button 
              onClick={() => onApply(job)}
              variant={isAuthenticated && userRole === 'worker' ? 'default' : 'secondary'}
            >
              {isAuthenticated && userRole === 'worker' ? 'Apply' : 'Login to Apply'}
            </Button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-muted-foreground">{job.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Jobs;
