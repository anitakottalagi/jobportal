const axios = require('axios');
const Job = require('../models/Job');
const UserProfile = require('../models/UserProfile');
const { sortJobsByMatch } = require('../services/jobMatchingService');
require('dotenv').config();

// Sample jobs used as fallback when external API is unavailable
const SAMPLE_JOBS = [
  {
    id: 'sample-1',
    title: 'Senior React Developer',
    company: 'TechCorp India',
    location: 'Bangalore, India',
    description: 'We are looking for an experienced React developer to join our team. You will build scalable web applications and mentor junior developers.',
    skills_required: ['React', 'JavaScript', 'TypeScript', 'Redux', 'CSS'],
  },
  {
    id: 'sample-2',
    title: 'Full Stack Engineer',
    company: 'StartupHub',
    location: 'Mumbai, India',
    description: 'Join our fast-growing startup as a full stack engineer. Work on exciting products used by millions.',
    skills_required: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS'],
  },
  {
    id: 'sample-3',
    title: 'Backend Node.js Developer',
    company: 'Infosys',
    location: 'Hyderabad, India',
    description: 'Build robust REST APIs and microservices for enterprise clients. Strong Node.js and database skills required.',
    skills_required: ['Node.js', 'Express', 'MongoDB', 'Redis', 'REST API'],
  },
  {
    id: 'sample-4',
    title: 'Frontend Developer',
    company: 'Wipro Digital',
    location: 'Pune, India',
    description: 'Create beautiful and responsive user interfaces for our digital products.',
    skills_required: ['React', 'HTML', 'CSS', 'JavaScript', 'Tailwind'],
  },
  {
    id: 'sample-5',
    title: 'DevOps Engineer',
    company: 'Amazon India',
    location: 'Chennai, India',
    description: 'Manage CI/CD pipelines, cloud infrastructure, and deployment automation.',
    skills_required: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Linux'],
  },
  {
    id: 'sample-6',
    title: 'Data Engineer',
    company: 'Flipkart',
    location: 'Bangalore, India',
    description: 'Design and build data pipelines for large-scale data processing.',
    skills_required: ['Python', 'Spark', 'Kafka', 'SQL', 'Airflow'],
  },
  {
    id: 'sample-7',
    title: 'Mobile App Developer',
    company: 'Zomato',
    location: 'Gurgaon, India',
    description: 'Build cross-platform mobile applications for our food delivery platform.',
    skills_required: ['React Native', 'JavaScript', 'Redux', 'iOS', 'Android'],
  },
  {
    id: 'sample-8',
    title: 'UI/UX Designer & Developer',
    company: 'Razorpay',
    location: 'Bangalore, India',
    description: 'Design and implement user interfaces for our fintech products.',
    skills_required: ['Figma', 'React', 'CSS', 'JavaScript', 'Design Systems'],
  },
  {
    id: 'sample-9',
    title: 'Python Backend Developer',
    company: 'Swiggy',
    location: 'Bangalore, India',
    description: 'Build scalable backend services using Python and Django/FastAPI.',
    skills_required: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis'],
  },
  {
    id: 'sample-10',
    title: 'Cloud Solutions Architect',
    company: 'TCS',
    location: 'Delhi, India',
    description: 'Design cloud architecture solutions for enterprise clients across various industries.',
    skills_required: ['AWS', 'Azure', 'GCP', 'Terraform', 'Microservices'],
  },
  {
    id: 'sample-11',
    title: 'React Native Developer',
    company: 'Paytm',
    location: 'Noida, India',
    description: 'Build and maintain mobile apps for our payments platform used by 300M+ users.',
    skills_required: ['React Native', 'JavaScript', 'TypeScript', 'Redux', 'REST API'],
  },
  {
    id: 'sample-12',
    title: 'Java Spring Boot Developer',
    company: 'HCL Technologies',
    location: 'Pune, India',
    description: 'Develop enterprise-grade microservices using Java and Spring Boot framework.',
    skills_required: ['Java', 'Spring Boot', 'Microservices', 'MySQL', 'Docker'],
  },
];

/**
 * Seed sample jobs into DB — called on startup and as fallback
 */
const seedSampleJobs = async () => {
  await Job.bulkUpsert(SAMPLE_JOBS);
  console.log(`✅ Seeded ${SAMPLE_JOBS.length} sample jobs`);
};

/**
 * Try to fetch from external API; fall back to sample jobs if anything goes wrong.
 * Called on server startup automatically.
 */
const fetchAndSeedJobs = async () => {
  // If DB already has jobs, skip seeding
  const existing = await Job.getAll();
  if (existing.length > 0) {
    console.log(`ℹ️  DB already has ${existing.length} jobs — skipping auto-seed`);
    return;
  }

  try {
    const apiKey = process.env.INDIAN_API_KEY;
    const apiUrl = process.env.INDIAN_API_URL;

    console.log('🔄 Fetching jobs from external API...');
    const response = await axios.get(`${apiUrl}/jobs`, {
      headers: { 'x-api-key': apiKey },
      timeout: 8000,
    });

    const rawJobs = response.data?.data || response.data?.jobs || response.data || [];
    const jobsArray = Array.isArray(rawJobs) ? rawJobs : [];

    if (jobsArray.length === 0) {
      console.log('⚠️  External API returned 0 jobs — using sample data');
      await seedSampleJobs();
      return;
    }

    const normalizedJobs = jobsArray.map((job, idx) => ({
      id: String(job.id || job._id || `api-${idx}-${Date.now()}`),
      title: job.title || job.job_title || 'Untitled',
      company: job.company || job.company_name || 'Unknown Company',
      location: job.location || job.job_location || 'Remote',
      description: job.description || job.job_description || '',
      skills_required: Array.isArray(job.skills)
        ? job.skills
        : job.skills
        ? String(job.skills).split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }));

    await Job.bulkUpsert(normalizedJobs);
    console.log(`✅ Fetched and stored ${normalizedJobs.length} jobs from API`);
  } catch (err) {
    // Any error (network, auth, timeout, etc.) → fall back to sample jobs
    console.log(`⚠️  External API unavailable (${err.message}) — using sample data`);
    await seedSampleJobs();
  }
};

// GET /jobs - Return all jobs sorted by match %
const getJobs = async (req, res) => {
  try {
    let jobs = await Job.getAll();

    // If DB is empty for some reason, seed on-the-fly
    if (jobs.length === 0) {
      await seedSampleJobs();
      jobs = await Job.getAll();
    }

    const profile = await UserProfile.get();
    const userSkills = profile?.skills || [];
    const sortedJobs = sortJobsByMatch(jobs, userSkills);

    res.json(sortedJobs);
  } catch (err) {
    console.error('getJobs error:', err.message);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
};

// GET /jobs/:id - Get single job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.getById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error('getJobById error:', err.message);
    res.status(500).json({ message: 'Server error fetching job' });
  }
};

// POST /jobs/fetch-from-api - Manually refresh jobs from external API
const fetchJobsFromAPI = async (req, res) => {
  try {
    const apiKey = process.env.INDIAN_API_KEY;
    const apiUrl = process.env.INDIAN_API_URL;

    const response = await axios.get(`${apiUrl}/jobs`, {
      headers: { 'x-api-key': apiKey },
      timeout: 8000,
    });

    const rawJobs = response.data?.data || response.data?.jobs || response.data || [];
    const jobsArray = Array.isArray(rawJobs) ? rawJobs : [];

    if (jobsArray.length === 0) {
      // API returned nothing — ensure sample jobs exist
      await seedSampleJobs();
      return res.json({ message: 'API returned no jobs. Sample jobs loaded.', count: SAMPLE_JOBS.length });
    }

    const normalizedJobs = jobsArray.map((job, idx) => ({
      id: String(job.id || job._id || `api-${idx}-${Date.now()}`),
      title: job.title || job.job_title || 'Untitled',
      company: job.company || job.company_name || 'Unknown Company',
      location: job.location || job.job_location || 'Remote',
      description: job.description || job.job_description || '',
      skills_required: Array.isArray(job.skills)
        ? job.skills
        : job.skills
        ? String(job.skills).split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }));

    await Job.bulkUpsert(normalizedJobs);
    res.json({ message: `Fetched and stored ${normalizedJobs.length} jobs`, count: normalizedJobs.length });
  } catch (err) {
    console.error('fetchJobsFromAPI error:', err.message);
    // Always fall back to sample jobs so the user sees something
    await seedSampleJobs();
    res.json({ message: 'API unavailable. Sample jobs loaded.', count: SAMPLE_JOBS.length });
  }
};

module.exports = { getJobs, getJobById, fetchJobsFromAPI, fetchAndSeedJobs };
