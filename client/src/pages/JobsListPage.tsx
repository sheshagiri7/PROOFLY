import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, MapPin, Layers, ArrowRight, Plus, Search, Filter } from 'lucide-react';
import { api, Job } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const JobsListPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getJobs();
      if (data && data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Open Engineering Positions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Jobs configured with normalized requirement weights and evidence-backed evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter roles or skills..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading available opportunities...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p>No job postings match your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    {job.department || 'Engineering'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {job.applicant_count || 0} applicants
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </h3>

                <p className="text-xs text-slate-300 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.company}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                </p>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {job.requirement_count || 8} Weighted Requirements
                </span>
                <Link
                  to={`/jobs/${job.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1 transition-colors"
                >
                  View Requirements <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
