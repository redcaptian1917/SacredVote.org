import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Mail, Phone, User, Send, CheckCircle2, Globe, Shield, ShieldCheck, Lock, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema, type ContactRequest } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import heroGov from "@/assets/images/hero-government.jpg";

export default function ContactPage() {
  const { toast } = useToast();
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

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative h-[300px] flex items-center bg-slate-900 overflow-hidden">
          <img 
            src={heroGov} 
            alt="Government building representing institutional authority" 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60" />
          <div className="max-w-5xl mx-auto px-6 w-full relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-serif font-bold text-white mb-4"
            >
              Contact Initiative
            </motion.h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
              Secure communication channels for community members and institutions.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            
            {/* Form Column - Left (60%) */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-primary h-2 w-full" />
                <CardHeader className="bg-slate-50/50 p-8 pb-6">
                  <CardTitle className="font-serif text-2xl">Secure Message Transmission</CardTitle>
                  <CardDescription>Fields marked with an asterisk are required for processing.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                  <Input placeholder="John Doe" className="pl-10" {...field} />
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
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                  <Input type="email" placeholder="john@example.com" className="pl-10" {...field} value={field.value || ""} />
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
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <Input type="tel" placeholder="(555) 000-0000" className="pl-10" {...field} value={field.value || ""} />
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
                            <FormLabel>Message *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How can we assist your community?" 
                                className="min-h-[150px] resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 h-auto text-lg rounded-xl"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Transmitting..." : "Send Secure Message"}
                        <Send className="ml-2 w-5 h-5" />
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Info Panel - Right (40%) */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-6">
                <h2 className="text-3xl font-serif font-bold text-slate-900 border-b-2 border-primary w-fit pb-2">Secure Communications</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  All messages submitted through this portal are routed directly through our encrypted infrastructure. Your communication remains entirely confidential and protected from interception.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">End-to-End Encrypted</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">Industry-standard encryption guarantees payload security in transit and at rest.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">Zero Data Retention</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">We do not store your correspondence longer than absolutely necessary to reply.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">Cryptographic Receipt</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">Every transmission is logged immutably without exposing plaintext contents.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-l-4 border-primary rounded-r-2xl shadow-sm">
                <p className="text-slate-700 font-medium italic">
                  "Privacy is not an afterthought—it is the foundational premise of our digital interaction."
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
