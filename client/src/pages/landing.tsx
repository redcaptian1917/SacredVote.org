import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Shield, Lock, FileCheck, Mail, Phone, User, Send, Cpu, Globe, CheckCircle2, Key, Vote, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema, type ContactRequest, type SiteContent, type SiteImage } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import heroGov from "@/assets/images/hero-government.jpg";
import techSecurity from "@/assets/images/tech-security.jpg";
import communityConsensus from "@/assets/images/community-consensus.jpg";
import pillarIdentity from "@/assets/images/pillar-identity.jpg";
import pillarAudit from "@/assets/images/pillar-audit.jpg";
import pillarImmutability from "@/assets/images/pillar-immutability.jpg";

function useCmsContent(section: string) {
  return useQuery<SiteContent[]>({
    queryKey: ["/api/content", section],
  });
}

function useCmsImages() {
  return useQuery<SiteImage[]>({
    queryKey: ["/api/images"],
  });
}

function getCmsValue(content: SiteContent[] | undefined, key: string, fallback: string): string {
  if (!content) return fallback;
  const item = content.find(c => c.key === key);
  return item?.value || fallback;
}

function getCmsImage(images: SiteImage[] | undefined, name: string, fallback: string): { src: string; alt: string } {
  if (!images) return { src: fallback, alt: "" };
  const img = images.find(i => i.name === name);
  return img ? { src: img.url, alt: img.altText } : { src: fallback, alt: "" };
}

export default function LandingPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { data: landingContent } = useCmsContent("landing");
  const { data: cmsImages } = useCmsImages();
  const form = useForm<ContactRequest>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactRequest) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Thank you for reaching out. We will get back to you shortly.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const heroImg = getCmsImage(cmsImages, "hero-government", heroGov);
  const techImg = getCmsImage(cmsImages, "tech-security", techSecurity);
  const communityImg = getCmsImage(cmsImages, "community-consensus", communityConsensus);
  const pillarIdImg = getCmsImage(cmsImages, "pillar-identity", pillarIdentity);
  const pillarAuditImg = getCmsImage(cmsImages, "pillar-audit", pillarAudit);
  const pillarImmImg = getCmsImage(cmsImages, "pillar-immutability", pillarImmutability);

  return (
    <Layout title="Secure Cryptographic Voting" description="SacredVote is a zero-trust cryptographic polling platform for municipalities, institutions, and community organizations. Post-quantum secure, formally verified, and end-to-end auditable.">
      <div className="flex-grow flex flex-col relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none z-0" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative w-full overflow-hidden bg-slate-900 h-[600px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImg.src} 
              alt={heroImg.alt || "Institutional Authority"} 
              className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0d3b6e]/80 to-slate-900 opacity-90" />
          </div>
          
          <div className="max-w-5xl mx-auto px-6 w-full z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-white text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                <Cpu className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
                {getCmsValue(landingContent, "hero-badge", "Democratic Infrastructure")}
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight md:whitespace-nowrap">
                {getCmsValue(landingContent, "hero-title", "Voting You Can ")}
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">
                  {getCmsValue(landingContent, "hero-title-highlight", "Actually Verify")}
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 leading-relaxed max-w-2xl font-light">
                {getCmsValue(landingContent, "hero-subtitle", "Replacing blind trust with mathematical certainty. Secure, verifiable, and immutable democratic processes for the modern age.")}
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-6 pt-4">
                <a
                  href="https://sacred.vote"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent"
                  data-testid="link-vote-cta"
                >
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  See Available Votes
                </a>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-[2px] bg-blue-500/50 hidden sm:block" aria-hidden="true" />
                  <p className="text-amber-400 font-medium flex items-center gap-2 text-sm tracking-wide uppercase backdrop-blur-sm px-2 py-1 rounded">
                    <Globe className="w-4 h-4 animate-pulse" aria-hidden="true" />
                    Portal Status: Under Active Development
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-slate-800 py-12 relative z-10" data-testid="section-stats-bar">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
              {/* Separators for desktop */}
              <div className="hidden md:block absolute top-1/2 left-1/4 -translate-y-1/2 w-px h-12 bg-white/20" />
              <div className="hidden md:block absolute top-1/2 left-2/4 -translate-y-1/2 w-px h-12 bg-white/20" />
              <div className="hidden md:block absolute top-1/2 left-3/4 -translate-y-1/2 w-px h-12 bg-white/20" />
              
              {[
                { value: "Military", label: "Grade Encryption" },
                { value: "Zero", label: "Single Points of Failure" },
                { value: "Shared", label: "No Single Gatekeeper" },
                { value: "100%", label: "Independently Verifiable" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center md:items-center space-y-2 relative z-10">
                  <span className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter" data-testid={`text-stat-value-${i}`}>
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-bold text-center" data-testid={`text-stat-label-${i}`}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-24 w-full z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32 py-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold text-slate-900 border-b-2 border-primary w-fit pb-2">
                {getCmsValue(landingContent, "vision-title", "Our Vision")}
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                <p>
                  {getCmsValue(landingContent, "vision-p1", "SacredVote is a next-generation digital polling and consensus platform built on the uncompromising principles of Zero-Trust architecture. In an era where digital data is easily manipulated, SacredVote replaces blind trust with mathematical certainty.")}
                </p>
                <p>
                  {getCmsValue(landingContent, "vision-p2", "It provides organizations, communities, and institutions with a mathematically verifiable method for conducting elections, gathering consensus, and executing operational decisions.")}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" aria-hidden="true" />
              <img 
                src={communityImg.src} 
                alt={communityImg.alt || "Community members engaged in collaborative discussion"} 
                className="relative rounded-2xl shadow-2xl border border-slate-100 object-cover aspect-[4/3]"
                loading="lazy"
              />
            </div>
          </div>

          {/* Process Steps Section */}
          <div className="mb-32 py-12" data-testid="section-process-steps">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Verification Lifecycle</h2>
              <p className="text-slate-500 max-w-2xl mx-auto uppercase tracking-widest text-[10px] font-bold">The Protocol Flow</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="absolute top-10 left-[12.5%] right-[12.5%] w-[75%] h-px bg-slate-200 hidden md:block" aria-hidden="true" />
              
              {[
                {
                  step: "1",
                  title: "Authenticate",
                  desc: "Confirm who you are through a secure, private process that never stores personal information"
                },
                {
                  step: "2",
                  title: "Authorize",
                  desc: "Receive permission to vote without your name or identity ever being linked to your ballot"
                },
                {
                  step: "3",
                  title: "Cast",
                  desc: "Your vote is sealed and recorded in a tamper-proof log the moment it is submitted"
                },
                {
                  step: "4",
                  title: "Verify",
                  desc: "Use your receipt to independently confirm your vote was counted — no need to trust anyone"
                }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-6 bg-white/50 rounded-2xl p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative z-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[#1a6fb5] flex items-center justify-center text-white text-2xl font-serif font-bold shadow-lg shadow-primary/20 border-4 border-white" data-testid={`badge-step-number-${i}`}>
                    {step.step}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-serif font-bold text-lg text-slate-900" data-testid={`text-step-title-${i}`}>{step.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed" data-testid={`text-step-desc-${i}`}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Matrix with Background Image */}
          <div className="mb-32 relative py-24 px-8 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 z-0">
              <img 
                src={techImg.src} 
                alt="" 
                className="w-full h-full object-cover opacity-10"
              />
              <div className="absolute inset-0 bg-white/80" />
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                  {getCmsValue(landingContent, "tech-matrix-title", "Built for Institutional Trust")}
                </h2>
                <p className="text-slate-500 max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold">Core Design Principles</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Shield,
                    title: "Zero-Trust Infrastructure",
                    desc: "No part of the system is trusted by default — not the network, not the server, not the user's device. Every action must be proven, not assumed.",
                    internalHref: "/technology#section-15",
                    externalHref: "https://csrc.nist.gov/pubs/sp/800/207/final",
                    externalLabel: "NIST SP 800-207"
                  },
                  {
                    icon: Lock,
                    title: "Strict Access Control",
                    desc: "Voting operations are kept completely separate from administration. No single person can control both the ballot system and the results.",
                    internalHref: "/technology#section-16",
                    externalHref: "https://csrc.nist.gov/projects/role-based-access-control",
                    externalLabel: "NIST RBAC Standard"
                  },
                  {
                    icon: FileCheck,
                    title: "Open and Auditable",
                    desc: "Built on open-source software. Any citizen, researcher, or official can inspect how votes are handled — nothing is hidden behind closed doors.",
                    internalHref: "/technology#section-17",
                    externalHref: "https://www.gnu.org/philosophy/free-sw.html",
                    externalLabel: "GNU Free Software Definition"
                  }
                ].map((tech, i) => (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(tech.internalHref)}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") navigate(tech.internalHref); }}
                    className="p-8 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl hover:border-primary transition-all hover:shadow-lg group cursor-pointer h-full flex flex-col"
                    data-testid={`card-feature-${i}`}
                  >
                    <tech.icon className="w-12 h-12 text-slate-400 group-hover:text-primary transition-colors mb-6" aria-hidden="true" />
                    <h4 className="font-serif font-bold text-lg mb-3 group-hover:text-primary transition-colors">{tech.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1">{tech.desc}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Read Deep-Dive →</span>
                      <a
                        href={tech.externalHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-slate-400 hover:text-primary underline underline-offset-2 transition-colors font-mono"
                        data-testid={`link-external-${i}`}
                      >
                        {tech.externalLabel}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Three Pillars */}
          <div className="mb-32 py-24 bg-primary rounded-3xl text-white px-8 md:px-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" aria-hidden="true" />
            <h2 className="text-3xl font-serif font-bold mb-12 text-center">Engineering Trust Through Three Pillars</h2>
            
            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              <div className="space-y-4">
                <div className="relative h-48 w-full rounded-xl overflow-hidden border border-white/20 mb-6 shadow-xl">
                  <img src={pillarIdImg.src} alt={pillarIdImg.alt || "Cryptographic Anonymity"} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-primary/40 flex items-center justify-center font-bold font-serif text-4xl text-white/20" aria-hidden="true">1</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <h4 className="text-white font-serif font-bold text-lg leading-tight drop-shadow-md">Cryptographic Anonymity</h4>
                  </div>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">Identity is separated from the ballot payload. Minimization protocols verify authorization without ever permanently linking identity to specific choices.</p>
              </div>
              <div className="space-y-4">
                <div className="relative h-48 w-full rounded-xl overflow-hidden border border-white/20 mb-6 shadow-xl">
                  <img src={pillarAuditImg.src} alt={pillarAuditImg.alt || "Forensic Auditability"} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-primary/40 flex items-center justify-center font-bold font-serif text-4xl text-white/20" aria-hidden="true">2</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <h4 className="text-white font-serif font-bold text-lg leading-tight drop-shadow-md">Forensic Auditability</h4>
                  </div>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">Systemic pathways and aggregate data are designed for clinical auditing. Tally accuracy can be mathematically verified without exposing user data.</p>
              </div>
              <div className="space-y-4">
                <div className="relative h-48 w-full rounded-xl overflow-hidden border border-white/20 mb-6 shadow-xl">
                  <img src={pillarImmImg.src} alt={pillarImmImg.alt || "Absolute Immutability"} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-primary/40 flex items-center justify-center font-bold font-serif text-4xl text-white/20" aria-hidden="true">3</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <h4 className="text-white font-serif font-bold text-lg leading-tight drop-shadow-md">Absolute Immutability</h4>
                  </div>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">Once processed, data is sealed. Role-based compartmentalization ensures that no single entity can alter the database without leaving a forensic trail.</p>
              </div>
            </div>
          </div>

          {/* Trust Signals Banner */}
          <div className="mb-32 py-16 px-6 rounded-3xl bg-gradient-to-b from-blue-50/30 to-white border border-blue-100/50" data-testid="section-trust-signals">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Shield, text: "Future-Proof Encryption" },
                { icon: Key, text: "Privacy Without Compromise" },
                { icon: Vote, text: "Peer-Reviewed Voting System" },
                { icon: Award, text: "Government Security Standards" },
                { icon: CheckCircle2, text: "Mathematically Verified" }
              ].map((signal, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-full shadow-sm hover:shadow-md hover:border-primary hover:text-primary transition-all duration-200 cursor-default group"
                  data-testid={`badge-trust-signal-${i}`}
                >
                  <signal.icon className="w-4 h-4 text-primary group-hover:text-primary transition-colors" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-primary transition-colors">{signal.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Support Section */}
          <div className="grid md:grid-cols-5 gap-16 items-start py-12" id="contact">
            <div className="md:col-span-2 space-y-8">
              <div className="space-y-6">
                <h2 className="text-3xl font-serif font-bold text-slate-900">Connect With Us</h2>
                <p className="text-slate-600 leading-relaxed">
                  SacredVote is an active member of the community. If you have questions about our upcoming toolset or wish to discuss a pilot project, please reach out.
                </p>
              </div>
              
              <div className="space-y-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" aria-hidden="true" />
                  Support Status
                </h3>
                <p className="text-slate-600 text-sm italic">
                  "We are not currently accepting donations, but will be opening support channels soon for those who wish to contribute to the mission."
                </p>
              </div>

              <div className="flex flex-col gap-4 text-slate-500 text-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  Official Community Initiative
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <Card className="border-2 border-slate-100 shadow-xl overflow-hidden rounded-2xl">
                <div className="bg-primary h-2 w-full" aria-hidden="true" />
                <CardHeader className="bg-slate-50/50">
                  <CardTitle className="font-serif text-2xl">Contact Initiative</CardTitle>
                  <CardDescription>All communications are handled through secure institutional channels.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" aria-hidden="true" />
                                  <Input placeholder="John Doe" className="pl-10" {...field} data-testid="input-contact-name" />
                                </div>
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
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" aria-hidden="true" />
                                  <Input type="email" placeholder="john@example.com" className="pl-10" {...field} value={field.value || ""} data-testid="input-contact-email" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" aria-hidden="true" />
                                <Input type="tel" placeholder="(555) 000-0000" className="pl-10" {...field} value={field.value || ""} data-testid="input-contact-phone" />
                              </div>
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
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How can we assist your community?" 
                                className="min-h-[120px] resize-none" 
                                {...field} 
                                data-testid="textarea-contact-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 h-auto text-lg"
                        disabled={mutation.isPending}
                        data-testid="button-send-message"
                      >
                        {mutation.isPending ? "Transmitting..." : "Send Secure Message"}
                        <Send className="ml-2 w-5 h-5" aria-hidden="true" />
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
