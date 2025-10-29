import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileText,
  Mail,
  Phone,
  MessageCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const contactFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a purpose"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Support = () => {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getUserData = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  const user = getUserData();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (location.hash) {
      const scrollToSection = () => {
        const target = document.querySelector(location.hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      };
      setTimeout(scrollToSection, 300);
    }
  }, [location]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("https://vinathaal.azhizen.com/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      await fetch("https://vinathaal.azhizen.com/api/slack-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          subject: data.subject,
          message: data.message,
        }),
      });

      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "How do I generate a question paper using AI?",
      answer:
        "Simply upload your syllabus or select from our templates, configure your requirements (number of questions, difficulty level, marks distribution), and our AI will generate a professional question paper within minutes.",
    },
    {
      question: "What formats can I download my question papers in?",
      answer:
        "You can download your question papers in PDF, Word (DOCX), or share them directly via email, WhatsApp, or Google Drive. All formats maintain professional formatting with your institution's branding.",
    },
    {
      question: "Can I customize the difficulty level and marks distribution?",
      answer:
        "Yes! You can set different difficulty levels (Easy, Medium, Hard) for each section, customize marks distribution, set time limits, and even configure unit-wise question allocation to match your syllabus perfectly.",
    },
    {
      question: "Is there a limit on how many question papers I can generate?",
      answer:
        "Our free plan allows up to 5 question papers per month. Premium plans offer unlimited generation, advanced customization options, priority support, and additional features like bulk generation and team collaboration.",
    },
    {
      question: "How accurate are the AI-generated questions?",
      answer:
        "Our AI is trained on extensive educational datasets and continuously improved. Questions are generated based on your specific syllabus and requirements. You can also review and edit any question before finalizing your paper.",
    },
    {
      question: "Can I save and reuse question paper templates?",
      answer:
        "Absolutely! You can save your custom configurations as templates, reuse previous question papers, and even share templates with colleagues. This saves time when creating similar papers in the future.",
    },
    {
      question: "Do you provide customer support for technical issues?",
      answer:
        "Yes, we offer comprehensive support through multiple channels - email, live chat, and our knowledge base. Premium users get priority support with faster response times and dedicated assistance.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <img
                src="/vinathaal%20logo.png"
                alt="Vinathaal Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
<h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight whitespace-normal md:whitespace-nowrap">
  How Can We{" "}
  <span className="bg-gradient-primary bg-clip-text text-transparent">
    Help You?
  </span>
</h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-3">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground">
              Quick answers to common questions about Vinathaal
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4 sm:py-6">
                  <span className="font-semibold text-sm sm:text-base text-foreground">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 sm:pb-6">
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section id="form" className="py-12 sm:py-16 bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-4">
              Still Need Help?
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground">
              Send us a message and we'll get back to you promptly
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <Card className="bg-gradient-card border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center text-primary text-xl sm:text-2xl">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Get in Touch
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">We're here to help you succeed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm text-foreground">Email Support</p>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      support@vinathaal.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm text-foreground">Phone Support</p>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
                <div className="bg-accent/10 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-accent font-medium">Response Time</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    We typically respond within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-accent/20">
              <CardHeader>
                <CardTitle className="text-primary text-xl sm:text-2xl">
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Fill out the form below and we'll get back to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
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
                          <FormLabel className="text-sm">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Purpose</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a Purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Technical Issues">Technical Issues</SelectItem>
                              <SelectItem value="Subscription Enquiry">Subscription Enquiry</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us how we can help you..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Support;