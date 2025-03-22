import { useState, useEffect } from "react";
import { PortfolioData, Project } from "@/types";
import ProjectCard from "./ProjectCard";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";

interface ProjectsSectionProps {
  data: PortfolioData;
  onProjectsReorder?: (projects: Project[]) => void;
}

const ProjectsSection = ({ data, onProjectsReorder }: ProjectsSectionProps) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Initialize projects with order property if not present
    const projectsWithOrder = data.projects.map((project, index) => ({
      ...project,
      order: project.order !== undefined ? project.order : index
    }));
    
    // Sort projects by order
    const sortedProjects = [...projectsWithOrder].sort((a, b) => 
      (a.order || 0) - (b.order || 0)
    );
    
    setProjects(sortedProjects);
  }, [data.projects]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // If dropped outside the list or no movement
    if (!destination || destination.index === source.index) {
      return;
    }

    const newProjects = Array.from(projects);
    const [removed] = newProjects.splice(source.index, 1);
    newProjects.splice(destination.index, 0, removed);

    // Update order property
    const updatedProjects = newProjects.map((project, index) => ({
      ...project,
      order: index
    }));

    setProjects(updatedProjects);

    // Notify parent if callback is provided
    if (onProjectsReorder) {
      onProjectsReorder(updatedProjects);
    }
  };

  return (
    <section id="projects" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          My Projects
        </motion.h2>
        <motion.p 
          className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          These are some of my recent projects. Feel free to check them out and explore the code on GitHub. Drag to reorder!
        </motion.p>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects-grid" direction="horizontal">
            {(provided) => (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {projects.map((project, index) => (
                  <ProjectCard 
                    key={`project-${index}`}
                    project={project}
                    index={index}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </section>
  );
};

export default ProjectsSection;
