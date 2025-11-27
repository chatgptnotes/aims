import React, { useState, useEffect } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import GitHubIcon from '@mui/icons-material/GitHub';

const VersionFooter = () => {
  const [version, setVersion] = useState('1.0.0');
  const [lastUpdated, setLastUpdated] = useState('2024-11-27');
  const [gitRepo, setGitRepo] = useState('bettroi/aims');

  useEffect(() => {
    // In production, this would fetch from package.json or environment variable
    // For now, using static values that will be updated via git hooks
    const pkgVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
    const buildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString().split('T')[0];
    const repo = import.meta.env.VITE_GIT_REPO || 'bettroi/aims';

    setVersion(pkgVersion);
    setLastUpdated(buildDate);
    setGitRepo(repo);
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 px-4 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <InfoIcon sx={{ fontSize: 14 }} />
            <span>AIMS v{version}</span>
          </div>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Updated: {lastUpdated}</span>
        </div>

        <div className="flex items-center space-x-2">
          <GitHubIcon sx={{ fontSize: 14 }} />
          <a
            href={`https://github.com/${gitRepo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {gitRepo}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default VersionFooter;
