import React from 'react';
import './ProfileProgress.css';

/**
 * ProfileProgress - Dynamic profile completion progress bar
 * Color: 0-40% Red, 40-70% Yellow, 70-100% Green
 */
const ProfileProgress = ({ profile }) => {
  // Fields that count toward completion
  const fields = ['name', 'email', 'education', 'skills', 'experience', 'resume_link', 'location'];

  const filledCount = fields.filter((field) => {
    const val = profile?.[field];
    if (Array.isArray(val)) return val.length > 0;
    return val && String(val).trim() !== '';
  }).length;

  const percentage = Math.round((filledCount / fields.length) * 100);

  const getColor = () => {
    if (percentage <= 40) return '#ef4444';   // Red
    if (percentage <= 70) return '#f59e0b';   // Yellow
    return '#10b981';                          // Green
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

      {/* Field checklist */}
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
