import React from 'react';
import { useData } from '../context/DataContext';
import { LazyImage } from '../components/LazyImage';

interface AboutPageProps {
  onNavigate?: (section: string) => void;
  onOpenSearch?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate = () => {}, onOpenSearch }) => {
  const { milestones } = useData();

  // Sort milestones by order
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <div id="about-page" className="w-full py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="mb-12 sm:mb-16 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-3">
          About The Studio
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-heading)] tracking-tight mb-6">
          The Studio
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-body)]/85 leading-relaxed max-w-2xl font-normal">
          AV Productions is an independent creative studio dedicated to cinema, visual direction, and deliberate storytelling.
        </p>
      </div>

      {/* Two-Column Studio Story */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16 pb-20 border-b border-[var(--border-color)] mb-20">
        <div className="md:col-span-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-heading)] mb-6 leading-snug tracking-tight">
            Natural light, deliberate pacing, and narrative clarity.
          </h2>
          <p className="text-base text-[var(--text-body)]/80 leading-relaxed font-normal mb-4">
            We approach each commission with singular authorship. In an environment oversaturated with ephemeral digital content, our focus remains on authentic physical presence — capturing evocative compositions with natural lighting, organic textures, and deliberate pacing.
          </p>
          <p className="text-base text-[var(--text-body)]/80 leading-relaxed font-normal">
            Image and sound are treated as equal halves of the experience. Every project is scored, mixed, and calibrated to resonate whether experienced in a cinema theater or personal headphones.
          </p>
        </div>

        <div className="md:col-span-6 flex flex-col justify-between pt-2">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider mb-2">
                Cinematography & Direction
              </h3>
              <p className="text-sm text-[var(--text-body)]/80 font-normal leading-relaxed">
                Specialized in narrative shorts, commercial brand films, music documentation, and campaign films that require a distinctive visual identity.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider mb-2">
                Visual Storycraft & Narrative Direction
              </h3>
              <p className="text-sm text-[var(--text-body)]/80 font-normal leading-relaxed">
                Translating conceptual scripts into compelling visual treatments, deliberate blocking, authentic casting, and memorable narrative arcs.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider mb-2">
                Post-Production & Color Science
              </h3>
              <p className="text-sm text-[var(--text-body)]/80 font-normal leading-relaxed">
                Precision editing with deliberate, tailored color grading engineered specifically for the emotional arc of each commission.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--color-gold)] font-semibold tracking-wider">
            <span>AV PRODUCTIONS</span>
            <span>EST. 2018</span>
          </div>
        </div>
      </div>

      {/* Chronological Studio Milestones */}
      <div className="mb-20">
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-2">
            Timeline
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-heading)]">
            Studio Milestones
          </h2>
        </div>

        <div className="relative pl-6 sm:pl-10 border-l border-[var(--border-color)] space-y-14">
          {sortedMilestones.map((milestone) => (
            <div
              key={milestone.id}
              id={`milestone-${milestone.id}`}
              className="relative group"
            >
              {/* Editorial Line Marker */}
              <div className="absolute -left-[25px] sm:-left-[41px] top-3.5 w-3.5 h-[1.5px] bg-[var(--color-gold)]/60 group-hover:w-5 group-hover:bg-[var(--color-gold)] transition-all" />

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors">
                  {milestone.title}
                </h3>
                {milestone.year && (
                  <span className="text-xs font-semibold text-[var(--color-gold)] tracking-wider">
                    {milestone.year}
                  </span>
                )}
              </div>

              <p className="text-base text-[var(--text-body)]/80 font-normal leading-relaxed max-w-3xl mb-4">
                {milestone.body}
              </p>

              {/* Optional Milestone Image */}
              {milestone.photoUrl && milestone.photoUrl.trim().length > 0 && (
                <div className="mt-4 rounded-sm overflow-hidden aspect-video max-w-2xl bg-[#101926] border border-[var(--border-color)]">
                  <LazyImage
                    src={milestone.photoUrl}
                    alt={milestone.title}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Studio Quote */}
      <div className="pt-12 pb-6 text-center max-w-2xl mx-auto">
        <p className="text-xl sm:text-2xl font-normal leading-relaxed text-[var(--text-heading)] mb-4 tracking-tight">
          "We treat every commission not as commercial turnover, but as a deliberate addition to our visual legacy."
        </p>
        <span className="text-xs font-semibold tracking-widest uppercase text-[var(--color-gold)]">
          AV Productions Studio
        </span>
      </div>
    </div>
  );
};
