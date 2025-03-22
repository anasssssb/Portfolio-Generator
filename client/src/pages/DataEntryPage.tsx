import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { portfolioSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PortfolioData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface DataEntryPageProps {
  onDataSubmit: (data: PortfolioData, id: number) => void;
}

// Define form schema based on shared schema
const dataEntryFormSchema = portfolioSchema;
type DataEntryFormValues = z.infer<typeof dataEntryFormSchema>;

const DataEntryPage = ({ onDataSubmit }: DataEntryPageProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with default values
  const form = useForm<DataEntryFormValues>({
    resolver: zodResolver(dataEntryFormSchema),
    defaultValues: {
      fullName: "",
      title: "",
      shortBio: "",
      profilePicture: "",
      detailedBio: "",
      skills: [""],
      projects: [
        {
          title: "",
          description: "",
          image: "",
          github: "",
        }
      ],
      socialMedia: [
        {
          name: "",
          url: "",
        }
      ],
    },
  });

  // Field arrays for dynamic fields
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: "skills" as "projects", // Type assertion to fix type error
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const { fields: socialMediaFields, append: appendSocialMedia, remove: removeSocialMedia } = useFieldArray({
    control: form.control,
    name: "socialMedia",
  });

  // Submit form data to API
  const createPortfolio = useMutation({
    mutationFn: async (data: DataEntryFormValues) => {
      const response = await apiRequest("POST", "/api/portfolio", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Your portfolio has been generated!",
      });
      
      // Pass the portfolio data and ID to parent component
      onDataSubmit(form.getValues(), data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate portfolio: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: DataEntryFormValues) {
    createPortfolio.mutate(data);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Portfolio Builder</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
            Fill out the form below to generate your personal portfolio website.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Info Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <span className="bg-primary-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            {...field} 
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Professional Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Web Developer" 
                            {...field} 
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="shortBio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Short Bio (Hero Section) *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A brief introduction that will appear in the hero section" 
                          rows={2} 
                          {...field} 
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* About Me Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <span className="bg-primary-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                  About Me
                </h2>
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Profile Picture *</FormLabel>
                      <div className="space-y-4">
                        {field.value && (
                          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary-500">
                            <img 
                              src={field.value} 
                              alt="Profile preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const fileInput = document.createElement('input');
                              fileInput.type = 'file';
                              fileInput.accept = 'image/*';
                              fileInput.onchange = async (e) => {
                                const target = e.target as HTMLInputElement;
                                if (!target.files?.length) return;
                                
                                const file = target.files[0];
                                const formData = new FormData();
                                formData.append('profilePicture', file);
                                
                                try {
                                  setIsUploading(true);
                                  const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData,
                                  });
                                  
                                  if (!response.ok) {
                                    throw new Error('Failed to upload image');
                                  }
                                  
                                  const data = await response.json();
                                  field.onChange(data.url);
                                } catch (error) {
                                  console.error('Error uploading image:', error);
                                  toast({
                                    title: "Upload Error",
                                    description: "Failed to upload image. Please try again.",
                                    variant: "destructive"
                                  });
                                } finally {
                                  setIsUploading(false);
                                }
                              };
                              fileInput.click();
                            }}
                          >
                            {isUploading ? "Uploading..." : "Upload Image"}
                          </Button>
                          {field.value && (
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => field.onChange("")}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <Input 
                          type="hidden"
                          {...field}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="detailedBio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Detailed Bio *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell your story, background, and what drives you..." 
                          rows={4} 
                          {...field} 
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Skills */}
                <div>
                  <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills *</FormLabel>
                  <div className="space-y-2">
                    {skillFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`skills.${index}`}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input 
                                  placeholder={`Skill ${index + 1}`} 
                                  {...field} 
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {index > 0 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeSkill(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendSkill("" as any)}
                    className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Skill
                  </Button>
                </div>
              </div>

              {/* Projects Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <span className="bg-primary-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                  Projects
                </h2>
                <div id="projectsContainer">
                  {projectFields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className="project-entry border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">Project {index + 1}</h3>
                        {index > 0 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeProject(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 dark:text-gray-300">Project Title *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="E-commerce Website" 
                                  {...field} 
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`projects.${index}.github`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 dark:text-gray-300">GitHub Link *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://github.com/yourusername/project" 
                                  {...field} 
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`projects.${index}.image`}
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel className="text-gray-700 dark:text-gray-300">Project Image *</FormLabel>
                            <div className="space-y-4">
                              {field.value && (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-primary-500">
                                  <img 
                                    src={field.value} 
                                    alt={`Project ${index + 1} preview`} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const fileInput = document.createElement('input');
                                    fileInput.type = 'file';
                                    fileInput.accept = 'image/*';
                                    fileInput.onchange = async (e) => {
                                      const target = e.target as HTMLInputElement;
                                      if (!target.files?.length) return;
                                      
                                      const file = target.files[0];
                                      const formData = new FormData();
                                      formData.append('profilePicture', file);
                                      
                                      try {
                                        setIsUploading(true);
                                        const response = await fetch('/api/upload', {
                                          method: 'POST',
                                          body: formData,
                                        });
                                        
                                        if (!response.ok) {
                                          throw new Error('Failed to upload image');
                                        }
                                        
                                        const data = await response.json();
                                        field.onChange(data.url);
                                      } catch (error) {
                                        console.error('Error uploading image:', error);
                                        toast({
                                          title: "Upload Error",
                                          description: "Failed to upload image. Please try again.",
                                          variant: "destructive"
                                        });
                                      } finally {
                                        setIsUploading(false);
                                      }
                                    };
                                    fileInput.click();
                                  }}
                                >
                                  {isUploading ? "Uploading..." : "Upload Image"}
                                </Button>
                                {field.value && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => field.onChange("")}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                              <Input 
                                type="hidden"
                                {...field}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`projects.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Project Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your project, technologies used, and your role..." 
                                rows={3} 
                                {...field} 
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendProject({
                    title: "",
                    description: "",
                    image: "",
                    github: "",
                  })}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-gray-700 dark:text-primary-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Another Project
                </Button>
              </div>
              
              {/* Social Media Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <span className="bg-primary-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                  Social Media Links
                </h2>
                <div id="socialMediaContainer">
                  {socialMediaFields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className="social-media-entry grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                    >
                      <FormField
                        control={form.control}
                        name={`socialMedia.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Platform Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="LinkedIn" 
                                {...field} 
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`socialMedia.${index}.url`}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-gray-700 dark:text-gray-300">URL *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://linkedin.com/in/yourusername" 
                                  {...field} 
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {index > 0 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeSocialMedia(index)}
                            className="text-red-500 hover:text-red-700 mt-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendSocialMedia({
                    name: "",
                    url: "",
                  })}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-gray-700 dark:text-primary-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Social Media
                </Button>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-center">
                <motion.button
                  type="submit"
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={createPortfolio.isPending}
                >
                  {createPortfolio.isPending ? "Generating..." : "Generate Portfolio"}
                </motion.button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default DataEntryPage;
