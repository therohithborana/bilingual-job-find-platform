
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_JOBS, MOCK_SERVICES } from "@/lib/models";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bluehire-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find the right job or talent
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connecting skills to opportunities
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/jobs">
              <Button size="lg" className="w-full sm:w-auto bg-white text-bluehire-700 hover:bg-gray-100">
                Apply for Jobs
              </Button>
            </Link>
            <Link to="/recruiter/job-post">
              <Button size="lg" className="w-full sm:w-auto bg-bluehire-700 text-white hover:bg-bluehire-800 border border-white">
                Post Jobs
              </Button>
            </Link>
            <Link to="/quick-jobs">
              <Button size="lg" className="w-full sm:w-auto bg-white text-bluehire-700 hover:bg-gray-100">
                Quick Service
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MOCK_SERVICES.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{service.icon}</div>
                  <h3 className="font-medium text-lg">{service.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Featured Jobs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_JOBS.slice(0, 3).map((job) => (
              <Card key={job._id} className="bluehire-card">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-bluehire-800">{job.title}</h3>
                  <p className="text-gray-500 mb-4">{job.location}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-bluehire-50 text-bluehire-700 px-2 py-1 rounded text-sm">
                      {job.type}
                    </span>
                    <span className="text-gray-700">
                      ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                  <div className="text-right">
                    <Link to={`/jobs/${job._id}`}>
                      <Button>Apply</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/jobs">
              <Button variant="outline">View All Jobs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-bluehire-100 flex items-center justify-center text-bluehire-600 text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Create Profile</h3>
              <p className="text-gray-600">
                Register and complete your profile with skills, experience, and location.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-bluehire-100 flex items-center justify-center text-bluehire-600 text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Find Opportunities</h3>
              <p className="text-gray-600">
                Apply for regular jobs or activate quick jobs to receive service requests.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-bluehire-100 flex items-center justify-center text-bluehire-600 text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Earn & Grow</h3>
              <p className="text-gray-600">
                Get paid for your skills and build your reputation through happy customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Now CTA */}
      <section className="py-16 bluehire-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of workers and recruiters already using BlueHire to connect skills with opportunities.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-bluehire-700 hover:bg-gray-100">
              Join Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
