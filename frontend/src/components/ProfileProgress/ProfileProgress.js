import React from 'react';
import './ProfileProgress.css';


const ProfileProgress = ({ profile }) => {
  
  const fields = ['name', 'email', 'education', 'skills', 'experience', 'resume_link', 'location'];

  const filledCount = fields.filter((field) => {
    const val = profile?.[field];
    if (Array.isArray(val)) return val.length > 0;
    return val && String(val).trim() !== '';
  }).length;

  const percentage = Math.round((filledCount / fields.length) * 100);

  const getColor = () => {
    if (percentage <= 40) return '#ef4444';   
    if (percentage <= 70) return '#f59e0b';   
    return '#10b981';                          
  };

  const getLabel = () => {
    if (percentage <= 40) return 'Needs Work';
    if (percentage <= 70) return 'Getting There';
    return 'Looking Great';
  };

  return (
    <div className="profile-progress">
      <div className="progress-header">
        <span className="progress-title">Profile Completion</span>
        <span className="progress-percentage" style={{ color: getColor() }}>
          {percentage}%
        </span>
      </div>

      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            background: getColor(),
            boxShadow: `0 0 8px ${getColor()}60`,
          }}
        />
      </div>

      <div className="progress-footer">
        <span className="progress-label" style={{ color: getColor() }}>
          {getLabel()}
        </span>
        <span className="progress-count">
          {filledCount}/{fields.length} fields filled
        </span>
      </div>

      
      <div className="progress-checklist">
        {fields.map((field) => {
          const val = profile?.[field];
          const filled = Array.isArray(val) ? val.length > 0 : val && String(val).trim() !== '';
          return (
            <span key={field} className={`check-item ${filled ? 'filled' : 'empty'}`}>
              {filled ? '✓' : '○'} {field.replace('_', ' ')}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileProgress;
