
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

const initDB = async () => {
  const c = await pool.connect();
  try {
    await c.query(`CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW())`);

    await c.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW())`);

    await c.query(`CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255), email VARCHAR(255), education TEXT, skills TEXT[],
      experience TEXT, resume_link TEXT, location VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    await c.query(`CREATE TABLE IF NOT EXISTS jobs (
      id VARCHAR(255) PRIMARY KEY, title VARCHAR(255) NOT NULL,
      company VARCHAR(255), location VARCHAR(255), description TEXT,
      skills_required TEXT[], source VARCHAR(50) DEFAULT 'api',
      created_by_admin INTEGER REFERENCES admins(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW())`);

    await c.query(`CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id VARCHAR(255) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      name VARCHAR(255), email VARCHAR(255), resume_link TEXT, cover_note TEXT,
      status VARCHAR(50) DEFAULT 'pending', admin_response TEXT,
      responded_at TIMESTAMP, applied_date TIMESTAMP DEFAULT NOW())`);

    console.log(' Database tables ready');
  } finally {
    c.release();
  }
};


app.use(cors({ origin: (o, cb) => cb(null, true), credentials: true }));
app.use(express.json());


const userAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'user') return res.status(403).json({ message: 'Not a user token' });
    req.userId = decoded.id;
    next();
  } catch { res.status(401).json({ message: 'Invalid or expired token' }); }
};


const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No admin token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Not an admin token' });
    req.adminId = decoded.id;
    next();
  } catch { res.status(401).json({ message: 'Invalid or expired token' }); }
};



const matchJobs = (jobs, userSkills = []) => {
  const norm = (s) => s.toLowerCase().trim();
  return jobs
    .map((job) => {
      const jobSkills = job.skills_required || [];
      const matched = jobSkills.filter((s) =>
        userSkills.some((u) => norm(u).includes(norm(s)) || norm(s).includes(norm(u)))
      );
      return { ...job, matchPercentage: jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : 0 };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};



const SAMPLE_JOBS = [
  { id: 'sample-1', title: 'Senior React Developer', company: 'TechCorp India', location: 'Bangalore', description: 'Build scalable React apps and mentor junior devs.', skills_required: ['React', 'JavaScript', 'TypeScript', 'Redux', 'CSS'] },
  { id: 'sample-2', title: 'Full Stack Engineer', company: 'StartupHub', location: 'Mumbai', description: 'Work on exciting products used by millions.', skills_required: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS'] },
  { id: 'sample-3', title: 'Backend Node.js Developer', company: 'Infosys', location: 'Hyderabad', description: 'Build REST APIs and microservices for enterprise clients.', skills_required: ['Node.js', 'Express', 'MongoDB', 'Redis', 'REST API'] },
  { id: 'sample-4', title: 'Frontend Developer', company: 'Wipro Digital', location: 'Pune', description: 'Create responsive UIs for digital products.', skills_required: ['React', 'HTML', 'CSS', 'JavaScript', 'Tailwind'] },
  { id: 'sample-5', title: 'DevOps Engineer', company: 'Amazon India', location: 'Chennai', description: 'Manage CI/CD pipelines and cloud infrastructure.', skills_required: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Linux'] },
  { id: 'sample-6', title: 'Data Engineer', company: 'Flipkart', location: 'Bangalore', description: 'Design and build data pipelines for large-scale processing.', skills_required: ['Python', 'Spark', 'Kafka', 'SQL', 'Airflow'] },
  { id: 'sample-7', title: 'Mobile App Developer', company: 'Zomato', location: 'Gurgaon', description: 'Build cross-platform mobile apps for food delivery.', skills_required: ['React Native', 'JavaScript', 'Redux', 'iOS', 'Android'] },
  { id: 'sample-8', title: 'Python Backend Developer', company: 'Swiggy', location: 'Bangalore', description: 'Build scalable backend services using Python.', skills_required: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis'] },
  { id: 'sample-9', title: 'Java Spring Boot Developer', company: 'HCL Technologies', location: 'Pune', description: 'Develop enterprise microservices with Java and Spring Boot.', skills_required: ['Java', 'Spring Boot', 'Microservices', 'MySQL', 'Docker'] },
  { id: 'sample-10', title: 'Cloud Solutions Architect', company: 'TCS', location: 'Delhi', description: 'Design cloud architecture for enterprise clients.', skills_required: ['AWS', 'Azure', 'GCP', 'Terraform', 'Microservices'] },
];

const seedJobs = async () => {
  for (const job of SAMPLE_JOBS) {
    await pool.query(
      `INSERT INTO jobs (id, title, company, location, description, skills_required)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
      [job.id, job.title, job.company, job.location, job.description, job.skills_required]
    );
  }
  console.log(` Seeded ${SAMPLE_JOBS.length} sample jobs`);
};

const autoSeedJobs = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM jobs');
  if (parseInt(rows[0].count) > 0) return;
  try {
    const res = await axios.get(`${process.env.INDIAN_API_URL}/jobs`, {
      headers: { 'x-api-key': process.env.INDIAN_API_KEY }, timeout: 8000,
    });
    const raw = res.data?.data || res.data?.jobs || res.data || [];
    const jobs = Array.isArray(raw) ? raw : [];
    if (!jobs.length) return seedJobs();
    for (const [i, job] of jobs.entries()) {
      const id = String(job.id || job._id || `api-${i}`);
      const skills = Array.isArray(job.skills) ? job.skills
        : job.skills ? String(job.skills).split(',').map(s => s.trim()) : [];
      await pool.query(
        `INSERT INTO jobs (id, title, company, location, description, skills_required)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [id, job.title || 'Untitled', job.company || 'Unknown', job.location || 'Remote', job.description || '', skills]
      );
    }
    console.log(` Seeded ${jobs.length} jobs from API`);
  } catch { await seedJobs(); }
};



app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password min 6 characters' });
    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (rows.length) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const { rows: [user] } = await pool.query(
      'INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email', [name, email, hash]);
    const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Account created', token, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    const user = rows[0];
    const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/auth/me', userAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id,name,email FROM users WHERE id=$1', [req.userId]);
  rows.length ? res.json(rows[0]) : res.status(404).json({ message: 'User not found' });
});


app.post('/admin/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const { rows } = await pool.query('SELECT id FROM admins WHERE email=$1', [email]);
    if (rows.length) return res.status(409).json({ message: 'Admin with this email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const { rows: [admin] } = await pool.query(
      'INSERT INTO admins (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email', [name, email, hash]);
    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Admin registered', token, admin });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/admin/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const { rows } = await pool.query('SELECT * FROM admins WHERE email=$1', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    const admin = rows[0];
    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Admin login successful', token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/admin/auth/me', adminAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id,name,email FROM admins WHERE id=$1', [req.adminId]);
  rows.length ? res.json(rows[0]) : res.status(404).json({ message: 'Admin not found' });
});


app.get('/profile', userAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM user_profiles WHERE user_id=$1', [req.userId]);
  rows.length ? res.json(rows[0]) : res.status(404).json({ message: 'Profile not found' });
});

app.post('/profile', userAuth, async (req, res) => {
  try {
    const { name, email, education, skills, experience, resume_link, location } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email required' });
    const parsedSkills = Array.isArray(skills) ? skills : skills ? skills.split(',').map(s => s.trim()) : [];
    const { rows: [p] } = await pool.query(
      `INSERT INTO user_profiles (user_id,name,email,education,skills,experience,resume_link,location)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.userId, name, email, education, parsedSkills, experience, resume_link, location]);
    res.status(201).json(p);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Profile already exists' });
    res.status(500).json({ message: err.message });
  }
});

app.put('/profile/:id', userAuth, async (req, res) => {
  try {
    const { name, email, education, skills, experience, resume_link, location } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email required' });
    const parsedSkills = Array.isArray(skills) ? skills : skills ? skills.split(',').map(s => s.trim()) : [];
    const { rows: [p] } = await pool.query(
      `UPDATE user_profiles SET name=$1,email=$2,education=$3,skills=$4,experience=$5,
       resume_link=$6,location=$7,updated_at=NOW()
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [name, email, education, parsedSkills, experience, resume_link, location, req.params.id, req.userId]);
    p ? res.json(p) : res.status(404).json({ message: 'Profile not found' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});



app.get('/jobs', userAuth, async (req, res) => {
  try {
    const { rows: jobs } = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    if (!jobs.length) { await seedJobs(); const r = await pool.query('SELECT * FROM jobs'); return res.json(matchJobs(r.rows, [])); }
    const { rows: profiles } = await pool.query('SELECT skills FROM user_profiles WHERE user_id=$1', [req.userId]);
    const userSkills = profiles[0]?.skills || [];
    res.json(matchJobs(jobs, userSkills));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/jobs/:id', userAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM jobs WHERE id=$1', [req.params.id]);
  rows.length ? res.json(rows[0]) : res.status(404).json({ message: 'Job not found' });
});

app.post('/jobs/fetch-from-api', userAuth, async (req, res) => {
  try {
    const r = await axios.get(`${process.env.INDIAN_API_URL}/jobs`, {
      headers: { 'x-api-key': process.env.INDIAN_API_KEY }, timeout: 8000,
    });
    const raw = r.data?.data || r.data?.jobs || r.data || [];
    const jobs = Array.isArray(raw) ? raw : [];
    if (!jobs.length) { await seedJobs(); return res.json({ message: 'API empty, sample jobs loaded', count: SAMPLE_JOBS.length }); }
    for (const [i, job] of jobs.entries()) {
      const id = String(job.id || `api-${i}`);
      const skills = Array.isArray(job.skills) ? job.skills : job.skills ? String(job.skills).split(',').map(s => s.trim()) : [];
      await pool.query(
        `INSERT INTO jobs (id,title,company,location,description,skills_required) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [id, job.title || 'Untitled', job.company || 'Unknown', job.location || 'Remote', job.description || '', skills]);
    }
    res.json({ message: `Fetched ${jobs.length} jobs`, count: jobs.length });
  } catch { await seedJobs(); res.json({ message: 'API unavailable, sample jobs loaded', count: SAMPLE_JOBS.length }); }
});



app.get('/applications', userAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.*, j.title AS job_title, j.company, j.location, j.description, j.skills_required
     FROM applications a LEFT JOIN jobs j ON a.job_id=j.id
     WHERE a.user_id=$1 ORDER BY a.applied_date DESC`, [req.userId]);
  res.json(rows);
});

app.post('/applications', userAuth, async (req, res) => {
  try {
    const { job_id, name, email, resume_link, cover_note } = req.body;
    if (!job_id || !name || !email) return res.status(400).json({ message: 'job_id, name and email required' });
    const { rows: existing } = await pool.query('SELECT id FROM applications WHERE job_id=$1 AND user_id=$2', [job_id, req.userId]);
    if (existing.length) return res.status(409).json({ message: 'Already applied for this job' });
    const { rows: [app] } = await pool.query(
      `INSERT INTO applications (user_id,job_id,name,email,resume_link,cover_note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.userId, job_id, name, email, resume_link, cover_note]);
    res.status(201).json(app);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/applications/:id', userAuth, async (req, res) => {
  const { rows } = await pool.query('DELETE FROM applications WHERE id=$1 AND user_id=$2 RETURNING *', [req.params.id, req.userId]);
  rows.length ? res.json({ message: 'Application removed' }) : res.status(404).json({ message: 'Application not found' });
});



app.get('/admin/applications', adminAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.*, u.name AS applicant_name, u.email AS applicant_email,
            j.title AS job_title, j.company, j.location
     FROM applications a
     LEFT JOIN users u ON a.user_id=u.id
     LEFT JOIN jobs j ON a.job_id=j.id
     ORDER BY a.applied_date DESC`);
  res.json(rows);
});

app.put('/admin/applications/:id/respond', adminAuth, async (req, res) => {
  try {
    const { status, admin_response } = req.body;
    if (!['selected', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Status must be selected or rejected' });
    const { rows: [app] } = await pool.query(
      `UPDATE applications SET status=$1, admin_response=$2, responded_at=NOW() WHERE id=$3 RETURNING *`,
      [status, admin_response || '', req.params.id]);
    app ? res.json({ message: 'Response sent', application: app }) : res.status(404).json({ message: 'Application not found' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/admin/jobs', adminAuth, async (req, res) => {
  try {
    const { title, company, location, description, skills_required } = req.body;
    if (!title || !company) return res.status(400).json({ message: 'Title and company required' });
    const skills = typeof skills_required === 'string'
      ? skills_required.split(',').map(s => s.trim()).filter(Boolean)
      : skills_required || [];
    const id = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { rows: [job] } = await pool.query(
      `INSERT INTO jobs (id,title,company,location,description,skills_required,source,created_by_admin)
       VALUES ($1,$2,$3,$4,$5,$6,'admin',$7) RETURNING *`,
      [id, title, company, location, description, skills, req.adminId]);
    res.status(201).json({ message: 'Job added', job });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/admin/jobs', adminAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
  res.json(rows);
});



app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

const start = async () => {
  await initDB();
  await autoSeedJobs();
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
};

start();
