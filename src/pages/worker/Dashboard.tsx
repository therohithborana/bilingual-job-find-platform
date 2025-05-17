import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Calendar, MapPin, Star, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  getJobPosts,
  getJobApplicationsByWorkerId,
  deleteJobApplication,
  createWorkerProfile,
  getWorkerProfileById
} from "@/lib/localStorage";

interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  cover_note?: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    type: string;
    category: string;
    location: string;
    salary_min: number;
    salary_max: number;
    recruiter_id: string;
    recruiter?: {
      id: string;
      company_name: string;
      profile?: {
        name: string;
      }
    }
  }
}

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Get or create worker profile
        const userId = user._id;
        let workerProfile = getWorkerProfileById(userId);
        
        if (!workerProfile) {
          // Create a worker profile if it doesn't exist
          workerProfile = createWorkerProfile({
            id: userId,
            skills: ['General Skills'],
            experience_years: 1,
            job_interests: ['General'],
            qualification: 'Not specified',
            availability: true,
            is_quick_job_active: false
          });
        }
        
        // Get job applications for this worker
        const apps = getJobApplicationsByWorkerId(userId);
        
        // Add job details to applications
        const allJobs = getJobPosts();
        
        const applicationsWithDetails = apps.map(app => {
          const job = allJobs.find(j => j.id === app.job_id) || {
            id: app.job_id,
            title: "Unknown Job",
            type: "unknown",
            category: "Unknown",
            location: "Unknown",
            salary_min: 0,
            salary_max: 0,
            experience_required: 0,
            recruiter_id: "",
            description: "",
            created_at: app.created_at,
          };
          
          return {
            ...app,
            job,
            recruiter: {
              company_name: "Company",
              profile: {
                name: "Company"
              }
            }
          };
        });
        
        setApplications(applicationsWithDetails);
        
        // If no applications exist, create mock data for demo purposes
        if (apps.length === 0) {
          const mockApplications = generateMockApplications(userId);
          setApplications(mockApplications);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications. Using development data.");
        // Use mock data for development
        const mockApplications = generateMockApplications(user._id);
        setApplications(mockApplications);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [user]);

  // Generate mock applications for development
  const generateMockApplications = (workerId: string): JobApplication[] => {
    const statuses: ('pending' | 'accepted' | 'rejected')[] = ['pending', 'accepted', 'rejected'];
    const jobTypes = ['full-time', 'part-time', 'contract'];
    const categories = ['Electrical', 'Plumbing', 'Construction', 'Carpentry'];
    const locations = ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'];
    const companies = ['ABC Construction', 'XYZ Facilities', 'PQR Buildings', 'LMN Services'];
    
    return Array(4).fill(null).map((_, i) => ({
      id: `mock-${i}`,
      job_id: `job-${i}`,
      worker_id: workerId,
      status: statuses[i % statuses.length],
      cover_note: i % 2 === 0 ? 'I am interested in this position and have relevant experience.' : undefined,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      job: {
        id: `job-${i}`,
        title: `${categories[i % categories.length]} Worker Needed`,
        type: jobTypes[i % jobTypes.length],
        category: categories[i % categories.length],
        location: locations[i % locations.length],
        salary_min: 15000 + (i * 2000),
        salary_max: 25000 + (i * 3000),
        recruiter_id: `recruiter-${i}`,
        recruiter: {
          id: `recruiter-${i}`,
          company_name: companies[i % companies.length],
          profile: {
            name: companies[i % companies.length]
          }
        }
      }
    }));
  };

  // Withdraw job application
  const handleWithdrawApplication = (applicationId: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    
    try {
      const success = deleteJobApplication(applicationId);
      
      if (success) {
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        toast.success("Application withdrawn successfully!");
      } else {
        toast.error("Failed to withdraw application");
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error("Failed to withdraw application");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Button asChild>
          <a href="/jobs">Browse Jobs</a>
        </Button>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-6">
          {applications.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Applications Yet</CardTitle>
                <CardDescription>
                  You haven't applied for any jobs yet. Browse available jobs to get started.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <a href="/jobs">Browse Jobs</a>
                </Button>
              </CardFooter>
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
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Building className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{application.job.recruiter?.company_name || "Company"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{application.job.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{application.job.type}</span>
                    </div>
                    <div className="mt-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                        {application.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {application.status === 'accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {application.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    {application.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleWithdrawApplication(application.id)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <CardDescription>
                Jobs you've saved for later will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't saved any jobs yet.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 