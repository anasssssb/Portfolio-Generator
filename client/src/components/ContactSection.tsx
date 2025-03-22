import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, Settings, Info, HelpCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ContactSectionProps {
  portfolioId: number | null;
}

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

// Schema for external service integration
const externalFormSchema = z.object({
  useExternalService: z.boolean().default(false),
  serviceType: z.enum(["google", "formspree", "emailjs", "custom"]).default("google"),
  formId: z.string().optional(),
  formUrl: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;
type ExternalFormConfig = z.infer<typeof externalFormSchema>;

const ContactSection = ({ portfolioId }: ContactSectionProps) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [externalFormOpen, setExternalFormOpen] = useState(false);
  // Default with the provided Google Form ID
  const [externalConfig, setExternalConfig] = useState<ExternalFormConfig>({
    useExternalService: false,
    serviceType: "google",
    formId: "1FAIpQLSeJJkl2STsfAD_TzsY_taK4SmT4Ykfu35TmSuRagQdjZIBxlA",
    formUrl: "",
  });

  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });
  
  const externalForm = useForm<ExternalFormConfig>({
    resolver: zodResolver(externalFormSchema),
    defaultValues: externalConfig,
  });

  // Handle external form configuration changes
  const handleExternalFormSave = (data: ExternalFormConfig) => {
    setExternalConfig(data);
    setExternalFormOpen(false);
    toast({
      title: "Settings saved",
      description: data.useExternalService 
        ? `Your form is now connected to ${data.serviceType.charAt(0).toUpperCase() + data.serviceType.slice(1)} Forms`
        : "Using default contact form",
    });
  };

  const sendMessage = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      // If using external service, we'll handle it differently
      if (externalConfig.useExternalService && externalConfig.formUrl) {
        // For demonstration, log the external submission
        console.log(`Submitting to external service: ${externalConfig.serviceType}`);
        
        // We could make a direct fetch request to the external service here
        // This is a simplified version just to demonstrate
        const externalResponse = await fetch(externalConfig.formUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            portfolioId: portfolioId,
          })
        });
        
        if (!externalResponse.ok) {
          throw new Error(`External form submission failed: ${externalResponse.statusText}`);
        }
        
        return await externalResponse.json();
      } else {
        // Regular internal API submission
        const payload = {
          ...data,
          portfolioId: portfolioId,
        };
        const response = await apiRequest("POST", "/api/contact", payload);
        return response.json();
      }
    },
    onSuccess: () => {
      setFormSubmitted(true);
      form.reset();
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully!",
      });
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    sendMessage.mutate(data);
  };

  // Handle direct submission to Google Forms
  const handleGoogleFormSubmit = () => {
    if (externalConfig.formId) {
      window.open(`https://docs.google.com/forms/d/e/${externalConfig.formId}/viewform`, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Google Form ID not configured",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div className="flex justify-between items-center mb-8">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Get In Touch
          </motion.h2>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setExternalFormOpen(true)}
                  className="rounded-full"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configure external form service</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
        
        <motion.p 
          className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Have a project in mind or just want to connect? Feel free to reach out using the form below.
        </motion.p>
        
        <div className="max-w-2xl mx-auto">
          {externalConfig.useExternalService && externalConfig.serviceType === "google" && externalConfig.formId ? (
            <div className="text-center">
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                This form is connected to Google Forms for enhanced functionality.
              </p>
              <Button 
                onClick={handleGoogleFormSubmit}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Open Google Form <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                You'll be redirected to Google Forms to complete your submission.
              </p>
            </div>
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">Your Name *</FormLabel>
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">Your Email *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="john@example.com" 
                              type="email" 
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
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Subject</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Project Inquiry" 
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
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Message *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your message here..." 
                            rows={5} 
                            {...field} 
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit"
                    className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    disabled={sendMessage.isPending}
                  >
                    {sendMessage.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            
              {/* Success Message */}
              {formSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Your message has been sent successfully! I'll get back to you soon.</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
          
          {/* External form configuration dialog */}
          <Dialog open={externalFormOpen} onOpenChange={setExternalFormOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Contact Form Settings</DialogTitle>
                <DialogDescription>
                  Connect your portfolio to an external form service for enhanced functionality.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...externalForm}>
                <form onSubmit={externalForm.handleSubmit(handleExternalFormSave)} className="space-y-6 py-4">
                  <FormField
                    control={externalForm.control}
                    name="useExternalService"
                    render={({ field }) => (
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="use-external" className="flex items-center space-x-2">
                          <span>Use external form service</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-gray-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Connect to services like Google Forms for enhanced data collection</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Switch
                          id="use-external"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                  
                  {externalForm.watch("useExternalService") && (
                    <Tabs defaultValue="google" className="w-full">
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="google" onClick={() => externalForm.setValue("serviceType", "google")}>Google Forms</TabsTrigger>
                        <TabsTrigger value="formspree" onClick={() => externalForm.setValue("serviceType", "formspree")}>Formspree</TabsTrigger>
                        <TabsTrigger value="custom" onClick={() => externalForm.setValue("serviceType", "custom")}>Custom</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="google">
                        <Card>
                          <CardHeader>
                            <CardTitle>Google Forms</CardTitle>
                            <CardDescription>
                              Connect to a Google Form to collect and manage responses
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <FormField
                              control={externalForm.control}
                              name="formId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Google Form ID</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="1FAIpQLSdxxxxxxxxxxxxxxxx" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <p className="text-xs text-gray-500">
                                    Find in your Google Form URL: forms.gle/xxxxx or forms/d/e/{'{FORM_ID}'}/viewform
                                  </p>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <a 
                              href="https://docs.google.com/forms/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              Create a Form <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </CardFooter>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="formspree">
                        <Card>
                          <CardHeader>
                            <CardTitle>Formspree</CardTitle>
                            <CardDescription>
                              Connect to Formspree for easy form handling
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <FormField
                              control={externalForm.control}
                              name="formUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Formspree Endpoint</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="https://formspree.io/f/xxxxxxxx" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <p className="text-xs text-gray-500">
                                    Create a form on Formspree and paste the endpoint URL here
                                  </p>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <a 
                              href="https://formspree.io/forms" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              Create a Form <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </CardFooter>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="custom">
                        <Card>
                          <CardHeader>
                            <CardTitle>Custom Endpoint</CardTitle>
                            <CardDescription>
                              Connect to a custom form endpoint
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <FormField
                              control={externalForm.control}
                              name="formUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Form URL</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="https://example.com/api/form" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <p className="text-xs text-gray-500">
                                    Enter the URL where form data should be submitted
                                  </p>
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  )}
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setExternalFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Help info section */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Contact Me</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Click the link below to enter your query in a Google Form.
                </p>
                <div className="mt-3">
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeJJkl2STsfAD_TzsY_taK4SmT4Ykfu35TmSuRagQdjZIBxlA/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Open Google Form <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
