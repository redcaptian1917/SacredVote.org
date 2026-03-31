import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { 
  Shield, 
  Target, 
  Users, 
  Landmark, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Search, 
  Cpu, 
  Network,
  ExternalLink,
  Quote
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type SiteContent, type SiteImage } from "@shared/schema";
import heroGov from "@/assets/images/hero-government.jpg";
import communityConsensus from "@/assets/images/community-consensus.jpg";

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

export default function AboutPage() {
  const { data: aboutContent } = useQuery<SiteContent[]>({ queryKey: ["/api/content", "about"] });
  const { data: cmsImages } = useQuery<SiteImage[]>({ queryKey: ["/api/images"] });

  const heroImg = getCmsImage(cmsImages, "hero-government", heroGov);
  const communityImg = getCmsImage(cmsImages, "community-consensus", communityConsensus);

  return (
    <Layout 
      title="About" 
      description="Learn about SacredVote's mission, founding principles, research foundation, and the engineering team behind cryptographic civic verification."
    >
      <div className="bg-white" data-testid="section-about-content">
        <div className="relative h-[400px] flex items-center bg-slate-900 overflow-hidden" data-testid="section-hero">
          <img 
            src={heroImg.src} 
            alt={heroImg.alt || "Government building representing institutional authority"} 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60" />
          <div className="max-w-5xl mx-auto px-6 w-full relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif font-bold text-white mb-6"
            >
              {getCmsValue(aboutContent, "about-hero-title", "Our Mission & Philosophy")}
            </motion.h1>
            <div className="bg-gradient-to-r from-transparent via-blue-400 to-transparent h-px w-48 mx-auto mt-8 mb-6" />
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-slate-300 max-w-2xl mx-auto font-light"
            >
              {getCmsValue(aboutContent, "about-hero-subtitle", "Engineering a future where democratic integrity is protected by mathematical certainty.")}
            </motion.p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-20 items-center mb-32">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold text-slate-900 border-l-4 border-primary pl-4">
                {getCmsValue(aboutContent, "about-genesis-title", "The Genesis")}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                {getCmsValue(aboutContent, "about-genesis-p1", "SacredVote was born from a critical observation of modern digital systems: the inherent vulnerability of trust. In a world where centralized authorities and digital records can be compromised, we sought a method to anchor democratic consensus in the immutable laws of cryptography.")}
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                {getCmsValue(aboutContent, "about-genesis-p2", "Our team of researchers and engineers works at the intersection of civic technology and advanced security to build infrastructure that is not just secure, but fundamentally incorruptible.")}
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
              <img src={communityImg.src} alt={communityImg.alt || "Community members in collaborative discussion"} className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
            {[
              { icon: Target, title: "Precision", desc: "Every vote is a unique cryptographic event, processed with clinical accuracy." },
              { icon: Users, title: "Inclusion", desc: "Designed to be accessible to every citizen while maintaining total privacy." },
              { icon: Landmark, title: "Integrity", desc: "Building the digital bedrock for future democratic institutions." }
            ].map((item, i) => (
              <div key={i} className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                <item.icon className="w-12 h-12 text-primary mx-auto mb-6" aria-hidden="true" />
                <h3 className="font-serif font-bold text-xl mb-4">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-primary rounded-3xl p-12 text-white text-center relative overflow-hidden mb-32" data-testid="section-transparency">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" aria-hidden="true" />
             <h2 className="text-3xl font-serif font-bold mb-6">
               {getCmsValue(aboutContent, "about-transparency-title", "A Commitment to Transparency")}
             </h2>
             <p className="text-xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
               {getCmsValue(aboutContent, "about-transparency-body", "As a non-partisan research initiative, our core value is the preservation of the citizen's voice. We believe that technology should serve the people, providing a transparent and auditable path to collective decision-making.")}
             </p>
          </div>

          <section className="mb-32" data-testid="section-principles">
            <h2 className="text-3xl font-serif font-bold text-slate-900 border-l-4 border-primary pl-4 mb-12">Founding Principles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  icon: ShieldCheck, 
                  title: "Zero Trust Architecture", 
                  desc: "System security does not depend on the integrity of any single administrator or server. Every component requires cryptographic proof." 
                },
                { 
                  icon: Lock, 
                  title: "Cryptographic Immutability", 
                  desc: "Once cast, every vote is anchored in a Merkle tree structure that makes retrospective alteration mathematically impossible to conceal." 
                },
                { 
                  icon: EyeOff, 
                  title: "Voter Anonymity", 
                  desc: "Advanced blind signature protocols ensure that while your eligibility is verified, your specific ballot remains decoupled from your identity." 
                },
                { 
                  icon: Search, 
                  title: "Forensic Auditability", 
                  desc: "Publicly verifiable proofs allow any third party to mathematically confirm the tally's accuracy without compromising privacy." 
                },
                { 
                  icon: Cpu, 
                  title: "Post-Quantum Resilience", 
                  desc: "Implementation of NIST-standardized lattice-based algorithms ensures long-term secrecy against future computational threats." 
                },
                { 
                  icon: Network, 
                  title: "Decentralized Consensus", 
                  desc: "Tallying authority is distributed across multiple independent trustees, preventing any single entity from accessing individual results." 
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-4 p-8 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 rounded-2xl" data-testid={`card-principle-${i}`}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl mb-3 text-slate-900">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Research Foundation */}
        <section className="bg-gradient-to-br from-slate-900 to-[#0d2d50] py-24 text-white relative overflow-hidden" data-testid="section-research">
          <Quote className="absolute -right-10 -top-10 w-96 h-96 text-white/5 opacity-20 rotate-12" />
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-12 text-center">Grounded in Peer-Reviewed Research</h2>
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div className="space-y-6">
                <p className="text-slate-300 text-lg leading-relaxed">
                  SacredVote integrates formally verified protocols including Belenios, a collaborative effort by INRIA, LORIA, and CNRS. These protocols provide the foundation for end-to-end verifiable voting systems used in high-stakes institutional environments.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Our architecture leverages Groth16 zk-SNARKs for efficient proof of correctness, BFV homomorphic encryption for secure tallying, and ML-DSA/ML-KEM post-quantum primitives to ensure security in the age of advanced computation.
                </p>
              </div>
              <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 relative">
                <blockquote className="text-2xl font-serif italic text-blue-200 border-l-4 border-primary pl-6 leading-relaxed">
                  "The system's security guarantees are derived from mathematical proofs, not operational trust assumptions."
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-32">
          <section className="mb-32" data-testid="section-governance">
            <h2 className="text-3xl font-serif font-bold text-slate-900 border-l-4 border-primary pl-4 mb-12">Governance Model</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div className="space-y-4 py-8 md:py-0 md:px-0 px-4" data-testid="text-governance-oversight">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-mono font-bold text-sm mb-6">01</div>
                <h3 className="font-serif font-bold text-xl text-slate-900">Independent Oversight</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  An external technical advisory board reviews all cryptographic specifications before deployment to ensure adherence to global standards.
                </p>
              </div>
              <div className="space-y-4 py-8 md:py-0 md:px-8 px-4" data-testid="text-governance-specification">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-mono font-bold text-sm mb-6">02</div>
                <h3 className="font-serif font-bold text-xl text-slate-900">Open Specification</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  All protocol specifications are published and subject to public comment periods before ratification by the community board.
                </p>
              </div>
              <div className="space-y-4 py-8 md:py-0 md:px-8 px-4" data-testid="text-governance-reproducible">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-mono font-bold text-sm mb-6">03</div>
                <h3 className="font-serif font-bold text-xl text-slate-900">Reproducible Builds</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Deterministic build pipelines (Nix) allow any party to independently verify binary integrity against the public source code.
                </p>
              </div>
            </div>
          </section>

          {/* PlausiDen Attribution */}
          <section className="text-center p-12 bg-gradient-to-br from-primary/5 to-slate-50 border border-primary/20 rounded-3xl relative" data-testid="section-attribution">
            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Engineered by PlausiDen</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              SacredVote is designed and built by PlausiDen, an engineering studio specializing in zero-trust infrastructure, cryptographic systems, and civic technology.
            </p>
            <a 
              href="https://PlausiDen.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all group font-bold"
              data-testid="link-plausiden-website"
            >
              Visit PlausiDen
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </section>
        </div>
      </div>
    </Layout>
  );
}
