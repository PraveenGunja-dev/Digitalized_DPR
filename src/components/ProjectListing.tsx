import React from 'react';
import { Calendar, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Project {
  name: string;
  planStart: string;
  planEnd: string;
  actualStart: string;
  actualEnd: string;
  members: number;
}

interface ProjectListingProps {
  projects: Project[];
  onProjectClick?: (project: any) => void;
}

export const ProjectListing: React.FC<ProjectListingProps> = ({ projects, onProjectClick }) => {
  return (
    <div className="p-6 md:p-8">
      <div className="space-y-5 md:space-y-5">
        {projects.map((project, index) => (
          <Card 
            key={index}
            className="flex flex-row items-center rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 p-3 md:p-4 cursor-pointer hover:border-primary w-full"
            onClick={() => onProjectClick && onProjectClick(project)}
          >
            {/* Left side - Icon */}
            <div className="flex-shrink-0 mr-6">
              <div className="w-14 h-14 rounded-lg  flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Adani Logo" 
                  className="h-6 w-auto"
                />
              </div>
            </div>
            
            {/* Middle content - Project name and details in a single line */}
            <div className="flex-grow flex flex-col md:flex-row md:items-center md:justify-around w-full min-w-0">
              <div className="min-w-0 flex flex-col md:flex-row md:items-center md:justify-around w-full">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-0 truncate">{project.name}</h3>
                
                <div className="flex items-center gap-2 md:gap-6">
                  <div className="flex items-center">
                    <Calendar className="text-[#22A04B] mr-2 flex-shrink-0" size={16} />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      PLAN: {project.planStart} → {project.planEnd}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <TrendingUp className="text-blue-500 mr-2 flex-shrink-0" size={16} />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      ACTUAL: {project.actualStart} → {project.actualEnd}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right side */}
              <div className="flex items-center mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end md:space-x-6 flex-shrink-0">
                <div className="flex items-center text-sm text-muted-foreground mr-4">
                  <Users className="mr-1 flex-shrink-0" size={16} />
                  <span className="whitespace-nowrap">{project.members} members</span>
                </div>
                
                <button 
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-all duration-200 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle button click if needed
                  }}
                >
                  <ChevronRight className="text-primary" size={20} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};