import React, { useState, useEffect, useCallback } from 'react';
import JobCard from '../../components/JobCard/JobCard';
import ApplyModal from '../../components/ApplyModal/ApplyModal';
import { getJobs, fetchJobsFromAPI, getProfile, createApplication, getApplications } from '../../services/api';
import './Home.css';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  
  const loadData = useCallback(async (triggerFetch = false) => {
    setLoading(true);
    setError('');
    try {
      const [jobsRes, profileRes, appsRes] = await Promise.allSettled([
        getJobs(),
        getProfile(),
        getApplications(),
      ]);

      const fetchedJobs = jobsRes.status === 'fulfilled' ? jobsRes.value.data : [];

      
      if (fetchedJobs.length === 0 || triggerFetch) {
        try {
          await fetchJobsFromAPI();
          const refreshed = await getJobs();
          setJobs(refreshed.data || []);
        } catch {
          setJobs(fetchedJobs);
        }
      } else {
        setJobs(fetchedJobs);
      }

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  
  const handleFetchFromAPI = async () => {
    setFetching(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetchJobsFromAPI();
      setSuccessMsg(res.data.message);
      
      const refreshed = await getJobs();
      setJobs(refreshed.data || []);
    } catch (err) {
      setError('Failed to fetch jobs from API');
    } finally {
      setFetching(false);
    }
  };

  
  const handleApplySubmit = async (formData) => {
    await createApplication(formData);
    setSuccessMsg(`Application submitted for ${selectedJob.title}`);
    const appsRes = await getApplications();
    setApplications(appsRes.data);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  
  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(q) ||
      job.company?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q) ||
      job.skills_required?.some((s) => s.toLowerCase().includes(q))
    );
  });

  const appliedJobIds = applications.map((a) => String(a.job_id));

  return (
    <div className="home-page">
      <div className="container">
       
        <div className="home-hero">
          <h1 className="hero-title">
            Find Your <span className="gradient-text">Dream Job</span>
          </h1>
          <p className="hero-subtitle">
            {profile
              ? `Welcome back, ${profile.name}! ${jobs.length} jobs matched to your profile.`
              : 'Create your profile to see personalized job matches.'}
          </p>

          
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, company, location, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>

        <div className="actions-bar">
          <div className="jobs-count">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </div>
          <button
            className="btn btn-outline fetch-btn"
            onClick={handleFetchFromAPI}
            disabled={fetching}
          >
            {fetching ? (
              <><span className="btn-spinner" /> Fetching...</>
            ) : (
              '⟳ Refresh Jobs'
            )}
          </button>
        </div>

        
        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        
        {!profile && !loading && (
          <div className="profile-warning">
            <span>⚠️</span>
            <span>
              <a href="/profile" className="warning-link">Create your profile</a> to see personalized job match percentages.
            </span>
          </div>
        )}

        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No jobs found</h3>
            <p>Try refreshing or adjusting your search</p>
            <button className="btn btn-primary" onClick={handleFetchFromAPI}>
              Fetch Jobs
            </button>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={setSelectedJob}
                appliedJobIds={appliedJobIds}
              />
            ))}
          </div>
        )}
      </div>

      
      {selectedJob && (
        <ApplyModal
          job={selectedJob}
          profile={profile}
          onClose={() => setSelectedJob(null)}
          onSubmit={handleApplySubmit}
        />
      )}
    </div>
  );
};

export default Home;
