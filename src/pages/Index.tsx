import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Zap, CheckCircle, Building, ArrowRight, Construction, PaintBucket, Wrench, Hammer, Plug, Heart } from "lucide-react";

// Mock job categories
const JOB_CATEGORIES = [
  { name: "Electrician", icon: <Plug className="h-6 w-6" /> },
  { name: "Plumbing", icon: <Wrench className="h-6 w-6" /> },
  { name: "Construction", icon: <Construction className="h-6 w-6" /> },
  { name: "Carpentry", icon: <Hammer className="h-6 w-6" /> },
  { name: "Painting", icon: <PaintBucket className="h-6 w-6" /> },
  { name: "Caregiving", icon: <Heart className="h-6 w-6" /> },
];

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/90 mix-blend-multiply" 
          aria-hidden="true"
        />
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1540611025311-01df3cef54b5?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", 
            opacity: 0.25
          }}
        />
        <div className="relative py-24 sm:py-32 container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
            Find Your Perfect Blue Collar Job
          </h1>
          <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto">
            Connecting skilled workers with quality job opportunities. Start your journey to better employment today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/jobs">
                <Briefcase className="h-5 w-5" />
                Browse Jobs
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 bg-white/10 text-white hover:bg-white/20">
              <Link to="/quick-jobs">
                <Zap className="h-5 w-5" />
                Quick Services
              </Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link to="/register">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Popular Job Categories</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Browse jobs in various blue-collar sectors and find opportunities that match your skills
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {JOB_CATEGORIES.map((category) => (
              <Link 
                key={category.name} 
                to={`/jobs?category=${category.name}`}
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-4">
                  {category.icon}
                </div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How BlueHire Works</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to find your next job or hire skilled workers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Register an account as a worker to apply for jobs or as a recruiter to post opportunities
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Browse or Post Jobs</h3>
              <p className="text-gray-600">
                Search for jobs that match your skills or post jobs to find qualified workers
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Connect & Succeed</h3>
              <p className="text-gray-600">
                Apply for jobs, interview, and get hired or find the perfect workers for your needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose BlueHire</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              The platform dedicated to blue-collar workers and employers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="mr-4 bg-blue-100 p-2.5 rounded-full text-blue-600">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Quality Job Listings</h3>
                </div>
                <p className="text-gray-600">
                  Verified employers posting legitimate job opportunities across various skill categories
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="mr-4 bg-blue-100 p-2.5 rounded-full text-blue-600">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Quick Services</h3>
                </div>
                <p className="text-gray-600">
                  Find immediate work opportunities or hire workers for urgent tasks in your area
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="mr-4 bg-blue-100 p-2.5 rounded-full text-blue-600">
                    <Building className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Trusted Companies</h3>
                </div>
                <p className="text-gray-600">
                  Connect with established businesses looking for skilled and reliable talent
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="mr-4 bg-blue-100 p-2.5 rounded-full text-blue-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Verified Skills</h3>
                </div>
                <p className="text-gray-600">
                  Showcase your expertise and qualifications to stand out to potential employers
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="mr-4 bg-blue-100 p-2.5 rounded-full text-blue-600">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Simple Applications</h3>
                </div>
                <p className="text-gray-600">
                  Apply to jobs with just a few clicks and track all your applications in one place
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="mr-4 bg-blue-100 p-2.5 rounded-full text-blue-600">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Fast Hiring</h3>
                </div>
                <p className="text-gray-600">
                  Streamlined process to help employers find the right workers quickly and efficiently
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of workers and employers already using BlueHire to connect skills with opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                <Link to={user?.role === 'worker' ? "/jobs" : "/recruiter/dashboard"}>
                  {user?.role === 'worker' ? 'Browse Jobs' : 'Manage Jobs'}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                  <Link to="/register">Create Account</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link to="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
