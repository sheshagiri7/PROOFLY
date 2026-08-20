import React, { useState } from 'react';
import { Calendar, Briefcase, GraduationCap, Code2, Award, CheckCircle2, FileText, ChevronRight, Sparkles } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  type: 'EDUCATION' | 'EXPERIENCE' | 'PROJECT' | 'CERTIFICATION';
  sourceSection: string;
  evidenceSnippet: string;
  status: 'VERIFIED' | 'SUPPORTED' | 'INFERRED';
  relatedSkill: string;
}

interface ProofTimelineProps {
  events?: TimelineEvent[];
}

export const ProofTimeline: React.FC<ProofTimelineProps> = ({ events }) => {
  const defaultEvents: TimelineEvent[] = [
    {
      id: 'tl-1',
      year: '2019',
      title: 'B.S. in Computer Science',
      type: 'EDUCATION',
      sourceSection: 'Education',
      evidenceSnippet: 'University of California, Berkeley - Bachelor of Science in Computer Science | Graduated: 2019 | GPA: 3.82',
      status: 'VERIFIED',
      relatedSkill: 'Computer Science Foundation'
    },
    {
      id: 'tl-2',
      year: '2019 - 2021',
      title: 'Software Engineer @ DataTech Solutions',
      type: 'EXPERIENCE',
      sourceSection: 'Experience',
      evidenceSnippet: 'Architected RESTful microservices in Python (Django) and managed PostgreSQL database schemas.',
      status: 'VERIFIED',
      relatedSkill: 'Python & PostgreSQL'
    },
    {
      id: 'tl-3',
      year: '2021 - Present',
      title: 'Senior Software Engineer @ Apex Cloud Systems',
      type: 'EXPERIENCE',
      sourceSection: 'Experience',
      evidenceSnippet: 'Developed high-performance Python APIs using FastAPI; optimized PostgreSQL database queries (p99 latency 42ms); built Docker container pipelines.',
      status: 'VERIFIED',
      relatedSkill: 'FastAPI, Docker & Distributed Systems'
    },
    {
      id: 'tl-4',
      year: '2024',
      title: 'OpenSync Distributed Event Bus',
      type: 'PROJECT',
      sourceSection: 'Projects',
      evidenceSnippet: 'Built an open-source event-driven messaging service in Python and Redis, with Docker deployment recipes.',
      status: 'VERIFIED',
      relatedSkill: 'Redis & Event-Driven Architecture'
    }
  ];

  const timelineList = events && events.length > 0 ? events : defaultEvents;
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent>(timelineList[timelineList.length - 1]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EDUCATION': return <GraduationCap className="w-4 h-4 text-purple-400" />;
      case 'EXPERIENCE': return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'PROJECT': return <Code2 className="w-4 h-4 text-emerald-400" />;
      default: return <Award className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              SIGNATURE TIMELINE
            </span>
            <h3 className="text-xl font-black text-white">PROOF TIMELINE™</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chronological evidence journey grounded in verified resume milestones.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">Click any milestone to inspect exact citations</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Timeline Line & Milestones */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {timelineList.map((item) => {
              const isSelected = selectedEvent?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedEvent(item)}
                  className={`cursor-pointer group relative p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Node Circle */}
                  <div
                    className={`absolute -left-[30px] top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 ring-4 ring-blue-500/20'
                        : 'bg-slate-900 border-slate-700 group-hover:border-slate-500'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-400">{item.year}</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                          {item.sourceSection}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h4>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Milestone Evidence Inspector */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-slate-800 space-y-4 bg-slate-900/90">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" /> Evidence Inspector
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {selectedEvent.status}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-mono text-slate-400">Milestone</p>
              <h4 className="text-sm font-bold text-white">{selectedEvent.title}</h4>
            </div>

            <div>
              <p className="text-[11px] font-mono text-slate-400">Timeline Period</p>
              <p className="text-xs font-mono text-blue-300">{selectedEvent.year}</p>
            </div>

            <div>
              <p className="text-[11px] font-mono text-slate-400">Related Competency</p>
              <p className="text-xs font-medium text-purple-300">{selectedEvent.relatedSkill}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <p className="text-[10px] font-mono text-slate-400 uppercase">Verbatim Resume Evidence</p>
              <p className="text-xs text-slate-200 font-mono italic leading-relaxed">
                "{selectedEvent.evidenceSnippet}"
              </p>
              <p className="text-[10px] text-slate-400 pt-1">Source: Resume / {selectedEvent.sourceSection}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
