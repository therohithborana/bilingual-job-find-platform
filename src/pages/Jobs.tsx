
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_JOBS, MOCK_LOCATIONS, JobPost } from "@/lib/models";

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  // Get unique categories from mock jobs
  const categories = Array.from(new Set(MOCK_JOBS.map(job => job.category)));
  
  // Filter jobs based on search criteria
  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesLocation = !location || job.location === location;
    const matchesCategory = !category || job.category === category;
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-bluehire-800 mb-8">Jobs</h1>
      
      {/* Search and filter section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bluehire-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {MOCK_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bluehire-500 focus:border-transparent"
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
            <JobCard key={job._id} job={job} />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No jobs found matching your criteria</p>
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
    </div>
  );
};

const JobCard = ({ job }: { job: JobPost }) => {
  return (
    <Card className="bluehire-card hover:scale-[1.01] transition-transform">
      <CardContent className="p-6">
        <div className="md:flex justify-between">
          <div>
            <h2 className="text-xl font-bold text-bluehire-800 mb-2">{job.title}</h2>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-bluehire-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-bluehire-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>{job.category}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-bluehire-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 md:text-right flex flex-col items-start md:items-end justify-between">
            <div className="mb-4">
              <span className="inline-block bg-bluehire-50 text-bluehire-700 px-3 py-1 rounded-full text-sm font-medium">
                {job.type}
              </span>
              <div className="mt-2 text-gray-600 text-sm">
                <span>Experience: {job.experienceRequired}+ years</span>
              </div>
              <div className="text-gray-500 text-sm">
                <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <Link to={`/jobs/${job._id}`}>
              <Button>Apply</Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-700">{job.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Jobs;
