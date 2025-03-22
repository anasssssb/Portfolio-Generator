import { PortfolioData } from "@/types";
import { motion } from "framer-motion";

interface AboutSectionProps {
  data: PortfolioData;
}

const AboutSection = ({ data }: AboutSectionProps) => {
  return (
    <section id="about" className="py-16 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          About Me
        </motion.h2>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            className="md:w-2/5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-secondary-500 rounded-lg opacity-10 scale-110 translate-x-4 translate-y-4"></div>
              <img 
                src={data.profilePicture} 
                alt={`${data.fullName}'s profile`} 
                className="rounded-lg shadow-lg w-full max-w-md mx-auto"
              />
            </div>
          </motion.div>
          <motion.div 
            className="md:w-3/5"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="text-gray-700 dark:text-gray-300 text-lg mb-8 whitespace-pre-line">
              {data.detailedBio}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">My Skills</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <motion.span 
                  key={index}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300 rounded-full text-sm font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
