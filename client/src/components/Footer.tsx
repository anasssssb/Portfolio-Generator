import { PortfolioData } from "@/types";
import { ChevronUp } from "lucide-react";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaDribbble, FaMedium, FaFacebook } from "react-icons/fa";

interface FooterProps {
  data: PortfolioData;
}

// Function to get the appropriate social media icon
const getSocialIcon = (name: string) => {
  const lowerCaseName = name.toLowerCase();
  
  if (lowerCaseName.includes("github")) return <FaGithub className="text-xl" />;
  if (lowerCaseName.includes("linkedin")) return <FaLinkedin className="text-xl" />;
  if (lowerCaseName.includes("twitter")) return <FaTwitter className="text-xl" />;
  if (lowerCaseName.includes("instagram")) return <FaInstagram className="text-xl" />;
  if (lowerCaseName.includes("dribbble")) return <FaDribbble className="text-xl" />;
  if (lowerCaseName.includes("medium")) return <FaMedium className="text-xl" />;
  if (lowerCaseName.includes("facebook")) return <FaFacebook className="text-xl" />;
  
  // Default icon if no match
  return <FaGithub className="text-xl" />;
};

const Footer = ({ data }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-white mb-2">{data.fullName}</h2>
            <p className="text-gray-400">{data.title}</p>
          </div>
          
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-3">Connect With Me</h3>
            <div className="flex space-x-4">
              {data.socialMedia.map((social, index) => (
                <a 
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-all duration-300"
                  aria-label={social.name}
                >
                  {getSocialIcon(social.name)}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <a 
              href="#home" 
              className="text-gray-400 hover:text-white transition-all duration-300"
              aria-label="Back to top"
            >
              <ChevronUp className="w-6 h-6" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500">© {currentYear} {data.fullName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
