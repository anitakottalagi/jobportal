import React from 'react';
import './JobCard.css';

/**
 * JobCard - Displays a single job listing with match percentage and apply button
 */
const JobCard = ({ job, onApply, appliedJobIds = [] }) => {
  const { id, title, company, location, description, skills_required, matchPercentage } = job;

  const isApplied = appliedJobIds.includes(String(id));

  const getMatchColor = (pct) => {
    if (pct >= 70) return '#10b981';
    if (pct >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getMatchLabel = (pct) => {
    if (pct >= 70) return 'Strong Match';
    if (pct >= 40) return 'Partial Match';
    return 'Low Match';
  };

  const truncate = (text, max = 140) =>
    text && text.length > max ? text.slice(0, max) + '...' : text;

  return (
    <div className="job-card fade-in">
      {/* Match badge */}
      {matchPercentage !== undefined && (
        <div
          className="match-badge"
          style={{
            color: getMatchColor(matchPercentage),
            borderColor: `${getMatchColor(matchPercentage)}40`,
            background: `${getMatchColor(matchPercentage)}15`,
          }}
        >
          <span className="match-dot" style={{ background: getMatchColor(matchPercentage) }} />
          {matchPercentage}% {getMatchLabel(matchPercentage)}
        </div>
      )}

      {/* Job header */}
      <div className="job-header">
        <div className="company-avatar">
          {company ? company.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="job-title-block">
          <h3 className="job-title">{title}</h3>
          <p className="job-company">{company}</p>
        </div>
      </div>

      {/* Location */}
      <div className="job-location">
        <span className="location-icon">📍</span>
        {location || 'Remote'}
      </div>

      {/* Description */}
      {description && (
        <p className="job-description">{truncate(description)}</p>
      )}

      {/* Skills */}
      {skills_required && skills_required.length > 0 && (
        <div className="job-skills">
          {skills_required.slice(0, 5).map((skill, i) => (
            <span key={i} className="badge badge-skill">{skill}</span>
          ))}
          {skills_required.length > 5 && (
            <span className="badge badge-skill">+{skills_required.length - 5}</span>
          )}
        </div>
      )}

      {/* Apply button */}
      <div className="job-footer">
        {isApplied ? (
          <span className="applied-tag">✓ Applied</span>
        ) : (
          <button
            className="btn btn-primary apply-btn"
            onClick={() => onApply(job)}
          >
            Apply Now →
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
