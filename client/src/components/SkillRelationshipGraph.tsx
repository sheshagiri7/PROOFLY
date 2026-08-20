import React, { useState } from 'react';
import { GitBranch, Sparkles, CheckCircle2, Info, ChevronRight } from 'lucide-react';

interface SkillNode {
  name: string;
  category: string;
  relationshipType: 'DIRECTLY_FOUND' | 'AI_INFERRED';
  evidenceText: string;
}

interface SkillRelationshipGraphProps {
  skillRelationships?: Array<{
    id: string;
    skill_name: string;
    parent_category: string;
    relationship_type: 'DIRECTLY_FOUND' | 'AI_INFERRED';
    evidence_text: string;
  }>;
}

export const SkillRelationshipGraph: React.FC<SkillRelationshipGraphProps> = ({ skillRelationships = [] }) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);

  // Group by category
  const categories: Record<string, SkillNode[]> = {
    'Backend & APIs': [],
    'Databases & Caching': [],
    'Cloud & Infrastructure': [],
    'Frontend & Full-Stack': []
  };

  skillRelationships.forEach(rel => {
    const node: SkillNode = {
      name: rel.skill_name,
      category: rel.parent_category,
      relationshipType: rel.relationship_type,
      evidenceText: rel.evidence_text
    };

    if (rel.parent_category.toLowerCase().includes('python') || rel.parent_category.toLowerCase().includes('backend')) {
      categories['Backend & APIs'].push(node);
    } else if (rel.parent_category.toLowerCase().includes('sql') || rel.parent_category.toLowerCase().includes('database')) {
      categories['Databases & Caching'].push(node);
    } else if (rel.parent_category.toLowerCase().includes('aws') || rel.parent_category.toLowerCase().includes('cloud') || rel.parent_category.toLowerCase().includes('devops')) {
      categories['Cloud & Infrastructure'].push(node);
    } else {
      categories['Frontend & Full-Stack'].push(node);
    }
  });

  const directCount = skillRelationships.filter(s => s.relationship_type === 'DIRECTLY_FOUND').length;
  const inferredCount = skillRelationships.filter(s => s.relationship_type === 'AI_INFERRED').length;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              SKILL RELATIONSHIP GRAPH
            </h3>
            <p className="text-xs text-slate-400">
              Taxonomy mapping candidate competencies with strict Direct vs AI-Inferred tagging.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold">Directly Found ({directCount})</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-500/30 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span className="font-semibold">AI-Inferred ({inferredCount})</span>
          </div>
        </div>
      </div>

      {/* Tree View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(categories).map(([catName, skills]) => {
          if (skills.length === 0) return null;
          return (
            <div key={catName} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider font-mono">
                  {catName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {skills.length} nodes
                </span>
              </div>

              <div className="space-y-2">
                {skills.map(skill => {
                  const isSelected = selectedSkill?.name === skill.name;
                  const isDirect = skill.relationshipType === 'DIRECTLY_FOUND';
                  return (
                    <div
                      key={skill.name}
                      onClick={() => setSelectedSkill(skill)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-blue-950/50 border-blue-400 shadow-md'
                          : isDirect
                          ? 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/50'
                          : 'bg-purple-950/20 border-purple-900/40 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isDirect ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        )}
                        <span className="font-medium text-slate-200">{skill.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isDirect
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        }`}
                      >
                        {isDirect ? 'DIRECT' : 'AI-INFERRED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Evidence Drawer */}
      {selectedSkill && (
        <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/30 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{selectedSkill.name}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  selectedSkill.relationshipType === 'DIRECTLY_FOUND'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                }`}
              >
                {selectedSkill.relationshipType === 'DIRECTLY_FOUND' ? 'VERIFIED IN RESUME' : 'AI ANALYSIS INFERRED'}
              </span>
            </div>
            <button
              onClick={() => setSelectedSkill(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg border border-slate-800">
            "{selectedSkill.evidenceText}"
          </p>
        </div>
      )}
    </div>
  );
};
