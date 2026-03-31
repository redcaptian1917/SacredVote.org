import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { ShieldCheck, KeyRound, Eye, Zap, Check, ExternalLink, Binary, Network, Shield, Lock, Cpu, Database, Layers, Code2, Fingerprint, Timer, Brain, FileCheck, Globe, Search, MapPin, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type SiteContent, type SiteImage } from "@shared/schema";
import techSecurity from "@/assets/images/tech-security.jpg";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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

function Section({ icon: Icon, number, title, children }: { icon: React.ElementType; number: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-24 space-y-6"
    >
      <div className="flex items-center gap-4 pb-6 border-b-2 border-slate-200">
        <Icon className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-serif font-bold text-slate-900">{number}. {title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </motion.div>
  );
}

function Card({ title, children, references }: { title: string; children: React.ReactNode; references?: string[] }) {
  return (
    <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50">
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      {children}
      {references && references.length > 0 && (
        <div className="mt-4 space-y-1">
          {references.map((ref, i) => (
            <p key={i} className="text-xs text-slate-500 font-mono">Reference: {ref}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function ParamList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-slate-600 ml-4 mb-4">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function TocLink({ number, title, isActive }: { number: string; title: string; isActive?: boolean }) {
  return (
    <li className={`transition-all duration-200 ${isActive ? "text-primary border-l-2 border-primary pl-4 -ml-4" : "text-slate-700 hover:text-primary hover:translate-x-1"}`}>
      <a href={`#section-${number}`} className="flex items-center gap-2" data-testid={`link-toc-section-${number}`}>
        <span className="font-mono text-sm text-primary font-bold w-6">{number}</span>
        <span className="text-sm font-medium">{title}</span>
      </a>
    </li>
  );
}

export default function TechnologyPage() {
  const [activeSection, setActiveSection] = useState<string>("");
  const { data: techContent } = useQuery<SiteContent[]>({ queryKey: ["/api/content", "technology"] });
  const { data: cmsImages } = useQuery<SiteImage[]>({ queryKey: ["/api/images"] });
  const heroImg = getCmsImage(cmsImages, "tech-security", techSecurity);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id.replace("section-", ""));
          }
        });
      },
      { threshold: 0.1, rootMargin: "-10% 0px -80% 0px" }
    );

    const sections = document.querySelectorAll('div[id^="section-"]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const sections = [
    { n: "1", title: "Cryptographic Identity & Authentication" },
    { n: "2", title: "Post-Quantum Cryptography (NIST 2024)" },
    { n: "3", title: "Zero-Knowledge Proofs (ZKPs)" },
    { n: "4", title: "Privacy-Preserving Tallying" },
    { n: "5", title: "Temporal Integrity & Anti-Injection" },
    { n: "6", title: "Adversarial Machine Learning Defense" },
    { n: "7", title: "Coercion Resistance" },
    { n: "8", title: "Formal Verification & Build Integrity" },
    { n: "9", title: "CARTA: Continuous Adaptive Risk & Trust Assessment" },
    { n: "10", title: "Distributed Infrastructure & Resilience" },
    { n: "11", title: "Audit & Transparency" },
    { n: "12", title: "Belenios Integration" },
    { n: "13", title: "Forensic Comparison Matrix" },
    { n: "14", title: "Geographic Access Control (ZK-ABAC)" },
    { n: "15", title: "Zero-Trust Infrastructure" },
    { n: "16", title: "Strict Role-Based Access Control (RBAC)" },
    { n: "17", title: "FOSS-First Commitment" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Scroll to hash anchor (e.g. #section-1) after page content renders */
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="bg-white">
        <div className="relative h-[400px] flex items-center bg-slate-900 overflow-hidden">
          <img
            src={heroImg.src}
            alt={heroImg.alt || "Technical security infrastructure"}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent" />
          <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
                {getCmsValue(techContent, "tech-hero-title", "Technical Specifications")}
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl font-light">
                {getCmsValue(techContent, "tech-hero-subtitle", "Sacred.Vote Architecture v1.0 — March 2026. Cryptographic verification, post-quantum resilience, formal verification, and distributed trust infrastructure.")}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col xl:flex-row gap-12">
            {/* Sticky Sidebar TOC */}
            <aside className="hidden xl:block w-[260px] shrink-0" data-testid="toc-sidebar">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 px-2">Table of Contents</h3>
                  <ul className="space-y-3">
                    {sections.map(s => (
                      <TocLink 
                        key={s.n} 
                        number={s.n} 
                        title={s.title} 
                        isActive={activeSection === s.n} 
                      />
                    ))}
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={scrollToTop}
                  className="w-full justify-start gap-2 text-slate-500 hover:text-primary"
                  data-testid="button-back-to-top"
                >
                  <ChevronUp className="w-4 h-4" />
                  Back to top
                </Button>
              </div>
            </aside>

            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16 p-10 rounded-3xl bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-primary/20"
              >
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Executive Summary</h2>
                <div className="space-y-4 text-slate-700 leading-relaxed text-lg">
                  <p>
                    Sacred.Vote is a zero-trust, cryptographically verifiable voting platform designed for the CARTA (Continuous Adaptive Risk and Trust Assessment) framework. Every security guarantee is derived from mathematical proofs, hardware-rooted attestation, and distributed cryptographic quorums.
                  </p>
                  <p>
                    The architecture addresses thirteen critical technology domains: hardware-bound identity verification, post-quantum cryptographic signatures, zero-knowledge eligibility proofs, fully homomorphic tallying, verifiable delay functions, adversarial machine learning defenses, coercion resistance, formal logic verification, continuous adaptive risk assessment, distributed consensus infrastructure, public audit mechanisms, and integration with the peer-reviewed Belenios voting system.
                  </p>
                </div>
              </motion.div>

              {/* Mobile/Inline TOC */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="xl:hidden mb-24 p-8 rounded-2xl border border-slate-200 bg-slate-50"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4">Table of Contents</h3>
                <ol className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sections.map(s => (
                    <TocLink 
                      key={s.n} 
                      number={s.n} 
                      title={s.title} 
                      isActive={activeSection === s.n}
                    />
                  ))}
                </ol>
              </motion.div>
            </div>
          </div>

          <div id="section-1">
            <Section icon={ShieldCheck} number="1" title="Cryptographic Identity & Authentication">
              <Card
                title="Hardware-Bound Attestation (FIPS 140-3 Level 3)"
                references={[
                  "NIST FIPS 140-3: Security Requirements for Cryptographic Modules (2024) — csrc.nist.gov/pubs/fips/140-3/final",
                  "WebAuthn Level 3 Security Specifications — w3.org/TR/webauthn-3/"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  All administrative and voter sessions are anchored to Secure Elements (SE) using the WebAuthn/FIDO2 protocol (CTAP 2.1). Private keys used for ballot signing are generated inside FIPS 140-3 Level 3 validated hardware modules (Yubikey, Nitrokey, or smartphone Secure Enclave) and are physically non-exportable. The public key is signed by the device's Attestation Certificate, proving to the server that the key was generated inside a tamper-resistant chip.
                </p>
                <p className="text-sm text-slate-600 font-mono mb-2">Protocol Parameters:</p>
                <ParamList items={[
                  "Protocol: WebAuthn L3 / CTAP 2.1",
                  "Security Level: FIPS 140-3 Level 3 (Hardware-Rooted)",
                  "Key Storage: Non-exportable, hardware-bound private keys",
                  "Attestation: Device Attestation Certificate chain"
                ]} />
              </Card>

              <Card
                title="Deterministic Token Generation (argon2id)"
                references={["RFC 9106: Argon2 Memory-Hard Function for Password Hashing"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Identity nullifiers are derived from canonicalized personally identifiable information (PII) using the argon2id hashing algorithm. Argon2id is a memory-hard function resistant to GPU and ASIC-based cracking attacks, combining data-dependent and data-independent memory access patterns.
                </p>
                <p className="text-sm text-slate-600 font-mono mb-2">argon2id Parameters:</p>
                <ParamList items={[
                  "Iterations (T): minimum 3",
                  "Memory Cost (M): 64 MB",
                  "Parallelism: 1 lane",
                  "Output: 256-bit identity nullifier"
                ]} />
              </Card>

              <Card
                title="Blind Signature Enrollment"
                references={["Privacy Pass: Blind Signature Protocol (IETF)", "Cloudflare Privacy Pass Implementation"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Ghost voting (administrators casting ballots for non-participating voters) is prevented via a four-step blind signature protocol that decouples voter identity from ballot authorization:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4 ml-4">
                  <li><strong>Step A (Verification):</strong> Voter proves identity out-of-band via government ID or verified authority</li>
                  <li><strong>Step B (Blinding):</strong> Voter creates a random Voter Token and blinds it with a mathematical factor. The blinded token is sent to the Gatekeeper</li>
                  <li><strong>Step C (Signing):</strong> Gatekeeper signs the blinded token without ever seeing the actual token value</li>
                  <li><strong>Step D (Unblinding):</strong> Voter removes the blinding factor locally, obtaining a valid, unlinkable signed Voter Token</li>
                </ul>
                <p className="text-slate-700 leading-relaxed">
                  When voting, the voter submits this token. The Gatekeeper cannot link the token to any voter identity because the unblinded token was never transmitted. Double votes are detected by checking token uniqueness against the ledger.
                </p>
              </Card>

              <Card
                title="Sybil-Resistance via Recursive Social Attestation"
                references={["Proof of Personhood: Sybil-Resistant Decentralized Identity (2025)", "The Limits of ZK for Age/Identity Verification (Brave, 2026)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  For elections lacking a central voter registry, Sacred.Vote implements decentralized Proof of Personhood (PoP) through a recursive social attestation graph. Verified administrators attest to voters they know, who in turn attest to others. Every attestation is recorded on a transparent, append-only Merkle Tree.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  If a verification node is found creating fraudulent accounts, that node's entire subtree is recursively revoked, containing the blast radius of the compromise. This structural approach ensures that fraud is not merely detected but systematically pruned from the attestation graph.
                </p>
              </Card>

              <Card
                title="Semantic Collision Resolution"
                references={["Deterministic Identity Canonicalization for Electoral Systems"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Phonetic canonicalization (e.g., double-metaphone) handles human data entry errors such as "Stephen" vs. "Steven." However, in large-scale elections, phonetically similar names combined with identical dates of birth create collision vectors where distinct citizens generate the same canonical identity.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Sacred.Vote appends high-entropy, non-phonetic attributes to the identity string before hashing:
                </p>
                <p className="text-slate-700 leading-relaxed mb-4 font-mono bg-white/50 p-4 rounded text-sm">
                  ID_final = Hash(Phonetic(Name) || DOB || Last4(VerifiedID))
                </p>
                <p className="text-slate-700 leading-relaxed">
                  This preserves phonetic resilience for usability while ensuring mathematical uniqueness across the voter population.
                </p>
              </Card>
            </Section>
          </div>

          <div id="section-2">
            <Section icon={KeyRound} number="2" title="Post-Quantum Cryptography (NIST 2024 Standards)">
              <Card
                title="The Post-Quantum Migration Imperative"
                references={[
                  "NIST Post-Quantum Cryptography Standards (2024)",
                  "Mosca's Theorem: Risk Analysis Framework for PQC Migration"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Post-quantum cryptography (PQC) is the development of cryptographic algorithms secure against attacks by quantum computers. Most widely-used public-key algorithms (RSA, ECC) depend on the difficulty of integer factorization or the discrete logarithm problem. These are solvable in polynomial time by Shor's algorithm on quantum computers.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong>Mosca's Theorem</strong> provides the urgency framework: If X + Y {">"} Z (where X = migration time, Y = data secrecy duration, Z = time until quantum computers arrive), migration is urgent. For election data that must remain confidential indefinitely, migration is critically urgent now.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  The "Harvest Now, Decrypt Later" (HNDL) threat model describes adversaries recording encrypted data today for future decryption when quantum computers become available. Sacred.Vote implements post-quantum algorithms to neutralize this threat.
                </p>
              </Card>

              <Card
                title="Lattice-Based Digital Signatures (ML-DSA / Dilithium-3)"
                references={["NIST FIPS 204: Module-Lattice-Based Digital Signature Standard (2024) — csrc.nist.gov/pubs/fips/204/final"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  All ballots and source code manifests are signed using NIST FIPS 204 ML-DSA (Module-Lattice-Based Digital Signature Algorithm), specifically the Dilithium-3 (ML-DSA-65) parameter set. ML-DSA security derives from the Short Integer Solution (SIS) problem over module lattices, which is mathematically resistant to Shor's algorithm.
                </p>
                <p className="text-sm text-slate-600 font-mono mb-2">ML-DSA-65 (Dilithium-3) Parameters:</p>
                <ParamList items={[
                  "Security Level: 3 (equivalent to AES-256)",
                  "Public Key Size: 1,312 bytes",
                  "Signature Size: 2,420 bytes",
                  "Sign/Verify Time: less than 1ms on modern CPUs",
                  "Security Reduction: Short Integer Solution (SIS) problem, NP-hard"
                ]} />
              </Card>

              <Card
                title="Key Encapsulation (ML-KEM / Kyber-768)"
                references={["NIST FIPS 203: Module-Lattice-Based Key-Encapsulation Standard (2024) — csrc.nist.gov/pubs/fips/203/final"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Ephemeral session keys are established using NIST FIPS 203 ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism), formerly CRYSTALS-Kyber-768. The client generates a random 32-byte secret, encapsulates it under the server's public key, and sends the encapsulation. The server decapsulates to recover the shared secret, which becomes the root key for AES-256-GCM session encryption.
                </p>
                <p className="text-sm text-slate-600 font-mono mb-2">ML-KEM-768 Parameters:</p>
                <ParamList items={[
                  "Security Level: 3 (equivalent to AES-256)",
                  "Encapsulated Key Size: 1,088 bytes",
                  "Shared Secret Size: 32 bytes",
                  "Encapsulation Time: less than 0.1ms",
                  "Security Basis: Module Learning With Errors (M-LWE) problem"
                ]} />
              </Card>

              <Card
                title="Six Families of Post-Quantum Algorithms"
                references={[
                  "PQCrypto Conference Series (2006-2026)",
                  "European Telecommunications Standards Institute (ETSI) Quantum Safe Cryptography Workshops"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Post-quantum cryptography research focuses on six mathematical approaches:
                </p>
                <div className="space-y-3 ml-4">
                  {[
                    { color: "border-primary", bg: "bg-blue-50/50", name: "Lattice-Based Cryptography", desc: "Security based on Short Vector Problem (SVP) and Closest Vector Problem (CVP) in lattices. Includes Ring-LWE, NTRU, and the NIST-standardized ML-DSA and ML-KEM. Sacred.Vote uses this family exclusively." },
                    { color: "border-emerald-500", bg: "bg-emerald-50/50", name: "Multivariate Polynomial Cryptography", desc: "Security based on solving systems of multivariate polynomial equations over finite fields. Includes Rainbow (Unbalanced Oil and Vinegar). Reduction to NP-hard MQ problem." },
                    { color: "border-amber-500", bg: "bg-amber-50/50", name: "Hash-Based Signatures", desc: "Security based on one-way property of cryptographic hash functions. Includes Merkle trees, XMSS, SPHINCS+, WOTS. Provably secure with reduction to hash function security." },
                    { color: "border-violet-500", bg: "bg-violet-50/50", name: "Code-Based Cryptography", desc: "Security based on difficulty of decoding random linear codes (Syndrome Decoding Problem). McEliece cryptosystem has resisted cryptanalysis for 40+ years." },
                    { color: "border-rose-500", bg: "bg-rose-50/50", name: "Isogeny-Based Cryptography", desc: "Security based on computing isogenies between supersingular elliptic curves. Includes CSIDH. Smallest key sizes but slower computation." },
                    { color: "border-cyan-500", bg: "bg-cyan-50/50", name: "Symmetric-Key Quantum Resistance", desc: "Existing symmetric algorithms (AES, SHA-3) are quantum-resistant with doubled key sizes. Grover's algorithm provides only quadratic speedup; AES-256 remains secure." }
                  ].map((item, i) => (
                    <div key={i} className={`p-4 rounded-lg border-l-4 ${item.color} ${item.bg}`}>
                      <h4 className="font-bold text-slate-900 mb-1">{i + 1}. {item.name}</h4>
                      <p className="text-slate-700 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card
                title="Post-Quantum Anonymity: Plover (Lattice-Based Threshold Blind Signatures)"
                references={["Plover: Practical Lattice-based Threshold Blind Signatures (2025) — eprint.iacr.org/2025/001"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Sacred.Vote utilizes Plover, a lattice-based Threshold Blind Signature (TBS) scheme, to decouple voter identity from the ballot in a post-quantum environment. Plover replaces classical blind RSA signatures with a lattice-based approach grounded in the Short Integer Solution (SIS) problem.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  The signer (Gatekeeper) approves voter eligibility without ever seeing the actual ballot hash. This provides quantum-resistant "blindness" that neutralizes future quantum de-anonymization attacks.
                </p>
              </Card>

              <Card
                title="Side-Channel Hardening"
                references={["Securing PQC Implementation Against AI-Enhanced Side-Channels (arXiv:2603.06969, 2026)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Post-quantum implementations are protected against physical side-channel attacks (electromagnetic eavesdropping, power analysis, timing attacks). Domain-Oriented Masking (DOM) masks all intermediate cryptographic values with random data, making computation statistically independent of the secret key. NTT (Number-Theoretic Transform) operations use randomized ordering to prevent instruction cache analysis.
                </p>
                <p className="text-sm text-slate-600 font-mono mb-2">Countermeasures:</p>
                <ParamList items={[
                  "Higher-Order Domain-Oriented Masking (DOM)",
                  "NTT Shuffling (randomized operation ordering)",
                  "Constant-time implementation for all branching operations"
                ]} />
              </Card>

              <Card title="Crypto-Agility & Hybrid Deployment" references={["NIST Migration Guidelines for Post-Quantum Cryptography (2024)"]}>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Sacred.Vote is designed with crypto-agility: the ability to replace cryptographic primitives without major architectural changes. If a weakness is discovered in lattice-based cryptography, the system can transition to alternative post-quantum primitives (code-based, hash-based, isogeny-based) without rewriting core logic.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Hybrid approaches combine classical (RSA/ECC) and post-quantum algorithms simultaneously during the transition period, providing defense-in-depth.
                </p>
              </Card>
            </Section>
          </div>

          <div id="section-3">
            <Section icon={Shield} number="3" title="Zero-Knowledge Proofs (ZKPs)">
              <Card title="Definition" references={["Goldwasser, Micali, Rackoff: The Knowledge Complexity of Interactive Proof Systems (1985)"]}>
                <p className="text-slate-700 leading-relaxed mb-4">
                  A zero-knowledge proof (ZKP) is a cryptographic protocol in which one party (the prover) can convince another party (the verifier) that a given statement is true, without conveying any information beyond the mere fact of the statement's truth.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Application in Voting:</strong> A voter can prove they are eligible to vote (their identity hash exists in the registered voter set) without revealing who they are. The system learns "this is a valid voter" but never learns the voter's identity.
                </p>
              </Card>

              <Card title="The Three Properties of Zero-Knowledge Proofs" references={["Interactive Proof Systems (Goldwasser, Micali, Rackoff, 1985)"]}>
                <div className="space-y-4">
                  {[
                    { name: "Completeness", desc: "If the statement is true and both parties follow the protocol, the verifier will be convinced. No false negatives." },
                    { name: "Soundness", desc: "If the statement is false, no cheating prover can convince an honest verifier, except with negligible probability. A dishonest voter cannot fabricate valid credentials." },
                    { name: "Zero-Knowledge", desc: "The verifier learns nothing beyond the truth of the statement. A simulator can produce transcripts indistinguishable from real interactions without access to the secret." }
                  ].map((prop, i) => (
                    <div key={i} className="p-4 rounded-lg border border-primary/20 bg-blue-50/50">
                      <h4 className="font-bold text-slate-900 mb-2">{i + 1}. {prop.name}</h4>
                      <p className="text-slate-700 text-sm">{prop.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Abstract Example: The Ali Baba Cave" references={["Quisquater et al.: How to Explain Zero-Knowledge Protocols to Your Children (1990)"]}>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Peggy (prover) knows the secret word that opens a door in a ring-shaped cave. Victor (verifier) wants proof that Peggy knows the secret without learning the word itself.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4 mb-4">
                  <li>Victor waits outside as Peggy enters the cave and takes either path A or B at random</li>
                  <li>Victor enters and randomly calls either "A" or "B"</li>
                  <li>If Peggy knows the secret, she opens the door and exits from whichever path Victor called</li>
                  <li>If she does not know the word, she has a 50% chance of guessing correctly per round</li>
                  <li>After 20 repetitions, the probability of successful deception is 1 in 2^20 (approximately one in a million)</li>
                </ol>
                <p className="text-slate-700 leading-relaxed">
                  Even if the entire interaction is recorded, the recording cannot prove knowledge of the secret to third parties, because any two people could produce an identical recording by agreeing on the sequence in advance.
                </p>
              </Card>

              <Card title="Abstract Example: The Red Card Proof" references={["Card-Based Cryptographic Protocols (2019)"]}>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Peggy draws a card from a standard 52-card deck and wants to prove it is red (heart or diamond) without revealing which card. She shows Victor all 26 black cards remaining in the deck. Since a standard deck contains exactly 26 red and 26 black cards, and all black cards are accounted for, Victor concludes with certainty that Peggy's hidden card is red.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Victor learns the card is red but gains no information about whether it is a heart or diamond, or which specific rank it is. If Peggy held a black card, she could not produce all 26 black cards from the remaining deck, demonstrating soundness.
                </p>
              </Card>

              <Card title="Interactive vs. Non-Interactive ZKPs" references={["Fiat-Shamir Heuristic: Non-Interactive Zero-Knowledge Proofs (1986)"]}>
                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong>Interactive ZKPs</strong> require multiple message exchanges between prover and verifier. Soundness error decreases exponentially with the number of rounds.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong>Non-Interactive ZKPs (NIZKs)</strong> allow the prover to send a single message. The Fiat-Shamir heuristic converts interactive proofs into non-interactive ones using a cryptographic hash function as a random oracle.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Sacred.Vote uses non-interactive ZKPs (specifically zk-SNARKs with Groth16) because voters cannot maintain persistent communication with the election server. A single proof is generated client-side and verified cryptographically.
                </p>
              </Card>

              <Card
                title="zk-SNARKs in Sacred.Vote"
                references={[
                  "Groth16: On the Size of Pairing-based Non-interactive Arguments (2016)",
                  "PlonK: Permutations over Lagrange-bases for Oecumenical Noninteractive arguments of Knowledge (2019)"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) are used in multiple capacities:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
                  <li><strong>Voter Eligibility:</strong> Voter generates a proof that their identity hash exists in the registered voter set without revealing their identity</li>
                  <li><strong>Ballot Validity:</strong> Each ballot is accompanied by a proof that it was correctly formed and encrypted, without revealing the vote choice</li>
                  <li><strong>Tally Verification:</strong> After decryption, a proof is published showing the decrypted result matches the homomorphic computation on encrypted ballots</li>
                  <li><strong>Trustee Verification:</strong> Each trustee proves correct partial decryption using ZKPs, ensuring no trustee manipulated results</li>
                </ul>
                <p className="text-sm text-slate-600 font-mono mb-2">Groth16 Parameters:</p>
                <ParamList items={[
                  "Proof Size: 288 bytes (3 group elements)",
                  "Verification Time: 2ms",
                  "Language: R1CS (Rank-1 Constraint System)"
                ]} />
              </Card>
            </Section>
          </div>

          <div id="section-4">
            <Section icon={Eye} number="4" title="Privacy-Preserving Tallying">
              <Card
                title="Fully Homomorphic Encryption (BFV Scheme)"
                references={[
                  "Microsoft SEAL: Homomorphic Encryption Library — microsoft.com/en-us/research/project/microsoft-seal/",
                  "Brakerski-Fan-Vercauteren Scheme (2012)"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Individual votes are never decrypted. Sacred.Vote implements the Brakerski-Fan-Vercauteren (BFV) fully homomorphic encryption scheme. Encrypted ballots can be mathematically combined without decryption: E(vote_1) + E(vote_2) = E(vote_1 + vote_2).
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Each voter encrypts their choice under the public election key. The server performs additive homomorphic operations on the ciphertexts to compute an encrypted final tally. Only the administrative quorum (k-of-n trustees) can decrypt the final aggregate result. No individual ballot is ever exposed as plaintext at any point in the pipeline.
                </p>
                <p className="text-sm text-slate-600 font-mono mb-2">Microsoft SEAL v7.0 Parameters:</p>
                <ParamList items={[
                  "Polynomial Degree: 8,192",
                  "Ciphertext Modulus: 128 bits",
                  "Multiplication Depth: 3 levels",
                  "Scheme: BFV (Brakerski-Fan-Vercauteren)"
                ]} />
              </Card>

              <Card
                title="Distributed Decryption (Shamir's Secret Sharing)"
                references={["How to Share a Secret (Adi Shamir, ACM, 1979) — dl.acm.org/doi/10.1145/359168.359176"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  The master decryption key is never held by a single entity. Using Shamir's Secret Sharing (SSS), the key is split into n shares where any k shares can reconstruct the key, but k-1 shares reveal no information about the key (information-theoretic security).
                </p>
                <p className="text-sm text-slate-600 font-mono mb-2">Threshold Configuration:</p>
                <ParamList items={[
                  "Threshold: k-of-n (e.g., 3-of-5)",
                  "Holders: Distributed among PlausiDen, FOSS auditors, and independent international observers",
                  "Security: Information-theoretically secure (k-1 shares reveal zero information)"
                ]} />
              </Card>
            </Section>
          </div>

          <div id="section-5">
            <Section icon={Timer} number="5" title="Temporal Integrity & Anti-Injection">
              <Card
                title="Verifiable Delay Functions (Wesolowski VDF)"
                references={[
                  "Efficient Verifiable Delay Functions (Boneh et al., 2018) — eprint.iacr.org/2018/601.pdf",
                  "VDF Applications in Decentralized Systems (MDPI, 2022) — mdpi.com/1424-8220/22/19/7524"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  To prevent last-minute ballot stuffing or result manipulation, the tallying phase is cryptographically locked behind a Verifiable Delay Function. Based on the Wesolowski scheme over an RSA group of unknown order, this requires a strictly sequential 10-minute compute window that cannot be parallelized.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  No results can be computed or viewed until the VDF proof is complete. This ensures a verified cooling-off period after polls close, preventing administrators or attackers from viewing trends or injecting ballots at the final moment.
                </p>
              </Card>

              <Card
                title="Merkle Mountain Range (MMR) Audit Trail"
                references={["Merkle Mountain Ranges for Append-Only Verification"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Every encrypted ballot is hashed into a Merkle Mountain Range (MMR), a dynamic Merkle Tree structure. The server publishes the Merkle Root (a single 32-byte hash) to a public, immutable source every 10 minutes.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Proof of Inclusion:</strong> A voter uses their receipt to verify that their encrypted ballot hash is included in the published Merkle Root. If the hash is missing, the voter has mathematical proof of vote suppression or fraud.
                </p>
              </Card>

              <Card
                title="Deterministic & Reproducible Build Pipeline (Nix)"
                references={["Reproducible Builds: Strategic Importance — reproducible-builds.org"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  All dependencies—compiler versions, libraries, kernel headers—are pinned to specific cryptographic hashes using Nix Flakes. Any auditor can execute the build locally and produce a binary with the exact same SHA-256 hash as the production server.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  If the hashes differ, the binary has been tampered with. This eliminates the possibility of supply-chain attacks or backdoor injection during the compilation process.
                </p>
              </Card>
            </Section>
          </div>

          <div id="section-6">
            <Section icon={Brain} number="6" title="Adversarial Machine Learning (AML) Defense">
              <Card
                title="RobEns (Robust Ensemble) Verification"
                references={["Analyzing Physical Adversarial Example Threats (arXiv:2603.00481, March 2026)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  For physical-to-digital ballot scanning, Sacred.Vote employs a multi-layered defense against adversarial pattern injection. Scanned ballots are processed by an ensemble of three distinct machine learning architectures:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
                  <li><strong>Convolutional Neural Network (CNN):</strong> Spatial feature extraction</li>
                  <li><strong>Vision Transformer (ViT):</strong> Global attention-based classification</li>
                  <li><strong>Heuristic Parser:</strong> Rule-based validation cross-check</li>
                </ul>
                <p className="text-slate-700 leading-relaxed">
                  Consensus across architecturally diverse models prevents single-model adversarial exploits. A perturbation optimized to fool one architecture is unlikely to simultaneously fool all three.
                </p>
              </Card>

              <Card
                title="Feature Squeezing"
                references={["Feature Squeezing: Detecting Adversarial Examples in Deep Neural Networks (2018)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  All input scans undergo bit-depth reduction and median filtering before classification. This "squeezes" out L1/L2 norm adversarial perturbations—small, carefully-crafted pixel modifications designed to trick ML classifiers.
                </p>
                <p className="text-sm text-slate-600 font-mono mb-2">Squeezing Pipeline:</p>
                <ParamList items={[
                  "Bit-depth reduction: 8-bit to 4-bit color quantization",
                  "Spatial smoothing: 3x3 median filter",
                  "Detection threshold: divergence between squeezed and unsqueezed predictions"
                ]} />
              </Card>
            </Section>
          </div>

          <div id="section-7">
            <Section icon={Lock} number="7" title="Coercion Resistance">
              <Card
                title="Anamorphic Encryption"
                references={["Anamorphic Encryption: Private Communication Against a Dictator (Persiano et al., 2022)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Anamorphic encryption allows a single ciphertext (the ballot) to be decrypted into two different plaintext messages depending on which key is used:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
                  <li><strong>Key A (Real Key):</strong> Decrypts to the voter's true choice</li>
                  <li><strong>Key B (Panic Key):</strong> Decrypts the exact same ciphertext to a different, pre-determined choice</li>
                </ul>
                <p className="text-slate-700 leading-relaxed">
                  Under coercion, the voter provides Key B. The coercer verifies the ballot and is satisfied. The election system, using the actual master key, tallies only the real vote. The coercer cannot distinguish between a real key and a panic key.
                </p>
              </Card>

              <Card
                title="Nullifiable Commitment Schemes"
                references={["zkVoting: Coercion-Resistant E-Voting with Nullifiable Commitments (2026)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Modern coercion-resistance research utilizes nullifiable commitment schemes. Voters receive one "real" key and multiple "fake" keys from the credential authority. A zero-knowledge proof demonstrates that the ballot is well-formed (structurally identical to a real vote), but only the tallier—using a master secret—can identify and silently discard fake ballots during summation.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  The coerced voter submits a valid-looking ballot that is cryptographically indistinguishable from a genuine one but has no effect on the final tally.
                </p>
              </Card>
            </Section>
          </div>

          <div id="section-8">
            <Section icon={Binary} number="8" title="Formal Verification & Build Integrity">
              <Card
                title="Formal Logic Proof (TLA+ / Coq)"
                references={["CompCert: Formally Verified C Compiler — compcert.org", "TLA+ Specification Language (Lamport, 1999)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Standard unit testing verifies code under anticipated conditions only. For high-stakes elections, the core state machine logic is formally verified using TLA+ or Coq, providing mathematical proof of correctness under all possible states and transitions.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong>Verified Invariants:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
                  <li>No voter can receive two tokens</li>
                  <li>No token can be generated without valid hardware attestation</li>
                  <li>No ballot can be decrypted before the VDF timer expires</li>
                  <li>The number of tallied votes cannot exceed the number of issued tokens</li>
                </ul>
                <p className="text-slate-700 leading-relaxed">
                  These proofs are mathematical certainties, not probabilistic test outcomes.
                </p>
              </Card>

              <Card
                title="Zero-Trust Architecture"
                references={["NIST SP 800-207: Zero Trust Architecture (2020)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Sacred.Vote assumes a fundamentally adversarial environment: the network is considered compromised, the server is considered under surveillance, and endpoints are considered potentially infected. All systems are modeled as hostile witnesses.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Security derives exclusively from mathematical properties of cryptographic algorithms, distributed quorums with no single point of failure, hardware-rooted attestation, and formal verification. Even complete server compromise does not breach voter privacy or ballot integrity.
                </p>
              </Card>

              <Card
                title="Continuous Source Attestation"
                references={["Provably Improving Election Verifiability in Belenios (Baloglu et al., IACR 2021)"]}
              >
                <p className="text-slate-700 leading-relaxed">
                  At startup, the server computes a SHA-256 hash of its execution context (binary, libraries, configuration), signs the hash with the post-quantum ML-DSA private key, and publishes it to a public, immutable ledger. Any auditor can query the /manifest endpoint to receive the current code hash and verify it against the server's published commitment. Hash mismatch indicates binary tampering.
                </p>
              </Card>
            </Section>
          </div>

          <div id="section-9">
            <Section icon={Zap} number="9" title="CARTA: Continuous Adaptive Risk & Trust Assessment">
              <Card
                title="Beyond Role-Based Access Control"
                references={["Gartner: Continuous Adaptive Risk and Trust Assessment (CARTA) Framework (2010)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Traditional Role-Based Access Control (RBAC) assigns static permissions that do not adapt to changing threat conditions. CARTA replaces static access models with Attribute-Based Access Control (ABAC), enabling continuous, context-aware security assessment in real-time.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Access decisions are made dynamically based on user attributes (authentication method, hardware verification status), device attributes (integrity, network), environmental attributes (geographic anomalies, request patterns), resource sensitivity, and temporal context.
                </p>
              </Card>

              <Card
                title="CARTA Implementation Phases"
                references={["NIST Risk Management Framework (RMF)", "OWASP Risk Rating Methodology"]}
              >
                <div className="space-y-4">
                  {[
                    { name: "Plan", desc: "Establish threat models and risk priorities. Determine data protection requirements, access policies, and acceptable risk baselines aligned with organizational objectives." },
                    { name: "Build", desc: "Integrate security into the development process (DevSecOps). All dependencies and third-party libraries are scanned for vulnerabilities. Cryptographic primitives and access controls are evaluated at every commit." },
                    { name: "Run", desc: "Real-time monitoring using automated analytics. Anomalies are detected and responded to immediately. Micro-segmentation ensures that a compromised component does not cascade to critical systems." }
                  ].map((phase, i) => (
                    <div key={i} className="p-4 rounded-lg border-l-4 border-primary bg-blue-50/50">
                      <h4 className="font-bold text-slate-900 mb-2">{phase.name} Phase</h4>
                      <p className="text-slate-700 text-sm">{phase.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card
                title="CARTA Key Components"
                references={["ETSI Quantum Safe Cryptography: Risk Assessment Framework"]}
              >
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li><strong>Data Collection:</strong> Security telemetry from authentication logs, network traffic, hardware attestations, cryptographic operations, and behavioral patterns</li>
                  <li><strong>Identification:</strong> Real-time risk detection including failed authentication attempts, unusual access patterns, device fingerprint mismatches, and anomalous cryptographic operations</li>
                  <li><strong>Assessment:</strong> Risk severity scoring with contextual weighting. A single failed login is low-risk; 10 failed attempts from 10 IPs in 1 minute is critical</li>
                  <li><strong>Mitigation:</strong> Proportional responses ranging from additional authentication challenges to access denial, credential revocation, and administrator escalation</li>
                </ol>
              </Card>

              <Card title="CARTA and Zero-Trust: Complementary Frameworks" references={["NIST SP 800-207: Zero Trust Architecture"]}>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Zero-Trust establishes the baseline: no user or device is inherently trusted. CARTA extends this with continuous evaluation: trust is not a binary state but a continuously-updated assessment that adapts to real-time risk conditions.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Sacred.Vote implements both: zero-trust posture (assume breach) combined with CARTA's continuous adaptive assessment (respond dynamically to emerging threats). High-risk operations such as opening vote tallies or modifying election parameters trigger immediate re-authentication with hardware attestation.
                </p>
              </Card>
            </Section>
          </div>

          <div id="section-10">
            <Section icon={Globe} number="10" title="Distributed Infrastructure & Resilience">
              <Card
                title="Byzantine Fault Tolerance (BFT) Consensus"
                references={["Tendermint: Byzantine Fault Tolerant Middleware", "HotStuff: BFT Consensus in the Lens of Blockchain (2019)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  A single server is a single point of failure. Sacred.Vote is designed for deployment across a distributed network of BFT nodes (e.g., Tendermint or HotStuff protocol). The election continues to operate correctly as long as fewer than 1/3 of the nodes are compromised.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Geographically distributed nodes ensure that infrastructure seizure in any single jurisdiction does not halt the election. Remaining nodes continue processing and tallying ballots.
                </p>
              </Card>

              <Card
                title="IPFS-Pinned Frontend (Content-Addressed Deployment)"
                references={["IPFS: Content-Addressed, Peer-to-Peer Hypermedia Protocol", "Subresource Integrity (SRI) — W3C Recommendation"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  The Sacred.Vote frontend is served from content-addressed storage (IPFS). The URL is not a domain name but a multihash of the code itself. If a single character of the frontend code is modified by an attacker, the hash changes, the URL breaks, and the voter is immediately alerted to tampering.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  This prevents JavaScript injection attacks where a compromised CDN replaces encryption scripts with malicious versions that leak cryptographic keys.
                </p>
              </Card>

              <Card
                title="Visual Cryptography (Analog Hole Defense)"
                references={["Visual Cryptography: Secret Sharing for Images (Naor & Shamir, 1994)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Even with perfect encryption, the voter's device screen is a physical vulnerability. Malware or hidden cameras can record the screen during ballot selection.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Sacred.Vote implements visual cryptography: the ballot is not displayed as plain text. The server sends two "share" images. One is displayed on-screen and the other is provided to the voter via a separate channel. Only when both shares are combined can the voter see the candidate names. A screen recorder captures only meaningless visual noise.
                </p>
              </Card>
            </Section>
          </div>

          <div id="section-11">
            <Section icon={Search} number="11" title="Audit & Transparency">
              <Card title="Public Audit Ledger" references={["IPFS: InterPlanetary File System Protocol"]}>
                <p className="text-slate-700 leading-relaxed">
                  Anonymized, encrypted ballots are published in real-time to content-addressed storage (IPFS) for independent verification. Any observer can monitor the stream of encrypted ballots without gaining information about individual vote contents. The ledger is append-only and immutable.
                </p>
              </Card>

              <Card title="Deterministic Build Badge" references={["Reproducible Builds — reproducible-builds.org"]}>
                <p className="text-slate-700 leading-relaxed">
                  A real-time status indicator displays the SHA-256 hash of the currently running binary alongside the hash of the latest GitHub main branch commit. If the hashes match, the running code is verified. If they diverge, the system flags potential binary tampering.
                </p>
              </Card>

              <Card title="Client-Side Vote Verification Tool" references={["Belenios: Verifiable Electronic Voting Specification — belenios.org/specification.pdf"]}>
                <p className="text-slate-700 leading-relaxed">
                  A client-side "Audit My Vote" tool allows voters to paste their cryptographic receipt and verify its inclusion in the encrypted tally via Merkle Proof of Inclusion. The verification runs entirely in the voter's browser. The receipt does not reveal the voter's choice to anyone, including the verification tool itself.
                </p>
              </Card>
            </Section>
          </div>

          <div id="section-12">
            <Section icon={Network} number="12" title="Belenios Integration & End-to-End Verifiability">
              <Card
                title="Belenios Overview"
                references={[
                  "Belenios Official Website — belenios.org",
                  "Belenios: Verifiable Electronic Voting Specification — belenios.org/specification.pdf"
                ]}
              >
                <p className="text-slate-700 leading-relaxed">
                  Belenios is a peer-reviewed, open-source verifiable voting system developed by INRIA, LORIA, and CNRS (France). It has been deployed in real elections globally and certified by leading cryptographers. Key properties include end-to-end verifiability (every voter can verify their ballot was counted), vote privacy (no party can learn an individual voter's choice), and verifiable credential schemes (separating voter identity from ballot authorization).
                </p>
              </Card>

              <Card
                title="Threshold Decryption & Quorum"
                references={["Belenios Protocol Specification: Distributed Key Generation (DKG)"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Belenios implements threshold decryption where n decryption trustees are designated. Each trustee generates their own key pair. Ballots are encrypted under the combined election public key. At tally time, each trustee computes a partial decryption. Only when at least k trustees collaborate (e.g., 3 out of 5) can the tally be decrypted.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  This prevents any single authority from unilaterally accessing results. Even if the server is compromised, results cannot be decrypted without trustee cooperation.
                </p>
              </Card>

              <Card
                title="Plover Integration (Lattice-Based Threshold Blind Signatures)"
                references={["Plover: Practical Lattice-based Threshold Blind Signatures (2025) — eprint.iacr.org/2025/001"]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Classical Belenios relies on ElGamal encryption, which is quantum-vulnerable. Sacred.Vote integrates Plover, a lattice-based Threshold Blind Signature (TBS) scheme, to replace classical blind signatures with post-quantum alternatives.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Plover decouples voter identity from the ballot using lattice-based cryptography grounded in the Short Integer Solution (SIS) problem, providing quantum-resistant blindness where the signer approves eligibility without seeing the ballot hash.
                </p>
              </Card>

              <Card
                title="Verifiable Credential Scheme"
                references={["Belenios Documentation: Credential Generation and Management"]}
              >
                <p className="text-slate-700 leading-relaxed">
                  Belenios uses credentials to prove voter eligibility without revealing identity. A credential authority generates a key pair for each registered voter. To vote, the voter uses their credential to prove eligibility. The ballot is signed with the credential (proving only registered voters cast it), but the credential is not included in the encrypted ballot, maintaining anonymity.
                </p>
              </Card>
            </Section>
          </div>

          <div id="section-13">
            <Section icon={Layers} number="13" title="Forensic Comparison Matrix">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" data-testid="table-forensic-comparison">
                  <caption className="sr-only">Forensic technology comparison: classical approaches versus Sacred.Vote 2026 implementations</caption>
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300">
                      <th scope="col" className="px-6 py-4 text-left font-bold text-slate-900 text-sm">Component</th>
                      <th scope="col" className="px-6 py-4 text-left font-bold text-slate-900 text-sm">Classical Approach</th>
                      <th scope="col" className="px-6 py-4 text-left font-bold text-slate-900 text-sm">Sacred.Vote (2026)</th>
                      <th scope="col" className="px-6 py-4 text-left font-bold text-slate-900 text-sm">Objective</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Encryption", "ECC / RSA", "ML-KEM (Kyber-768)", "Quantum Resistance"],
                      ["Digital Signatures", "ECDSA", "ML-DSA (Dilithium-3)", "Post-Quantum Non-Repudiation"],
                      ["Anonymity", "Blind RSA", "Lattice-TBS (Plover)", "Post-Quantum Privacy"],
                      ["Verification", "Simple Tally", "zk-SNARKs (Groth16)", "End-to-End Verifiability"],
                      ["Coercion Defense", "Last-Vote-Counts", "Anamorphic Encryption", "Cryptographic Plausible Deniability"],
                      ["Identity", "Passwords / SMS", "WebAuthn/FIDO2 (FIPS 140-3)", "Hardware-Bound Authentication"],
                      ["Tallying", "Server-Side Decrypt", "Homomorphic BFV (SEAL)", "Zero-Knowledge Aggregation"],
                      ["Build Integrity", "Manual Deployment", "Nix Deterministic Builds", "Binary Hash Attestation"],
                      ["Timing", "No Protection", "Wesolowski VDF", "Sequential Time-Lock"],
                      ["Audit Trail", "Database Logs", "Merkle Mountain Range", "Immutable Inclusion Proofs"],
                      ["ML Defense", "None", "RobEns Ensemble + Squeezing", "Adversarial Pattern Rejection"],
                      ["Access Control", "Static RBAC", "CARTA (ABAC)", "Continuous Adaptive Trust"]
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-6 py-3 font-bold text-slate-900 border-b border-slate-200 text-sm">{row[0]}</td>
                        <td className="px-6 py-3 text-slate-500 border-b border-slate-200 text-sm">{row[1]}</td>
                        <td className="px-6 py-3 text-emerald-700 font-semibold border-b border-slate-200 text-sm">{row[2]}</td>
                        <td className="px-6 py-3 text-slate-700 border-b border-slate-200 text-sm">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 overflow-x-auto">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Threat Defense Matrix</h3>
                <table className="w-full border-collapse" data-testid="table-threat-defense">
                  <caption className="sr-only">Threat defense matrix: attack vectors and Sacred.Vote countermeasures</caption>
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300">
                      <th scope="col" className="px-6 py-4 text-left font-bold text-slate-900 text-sm">Threat Vector</th>
                      <th scope="col" className="px-6 py-4 text-left font-bold text-slate-900 text-sm">Attack Method</th>
                      <th scope="col" className="px-6 py-4 text-left font-bold text-slate-900 text-sm">Sacred.Vote Defense</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Synthetic Identities", "AI-generated voter profiles, Sybil swarms", "Hardware-bound FIDO2 attestation (FIPS 140-3)"],
                      ["Ghost Voting", "Administrator-injected ballots for non-voters", "Blind signatures (unlinkable credentials)"],
                      ["Vote Manipulation", "Altering tallied results post-election", "Merkle Mountain Range (MMR) audit trail"],
                      ["Quantum Decryption", "Harvest-now, decrypt-later attacks", "Post-quantum ML-DSA & ML-KEM (NIST 2024)"],
                      ["Last-Minute Injection", "Ballot stuffing in final seconds", "Verifiable Delay Function (10-min VDF)"],
                      ["Voter Coercion", "Forced vote disclosure via receipt", "Anamorphic encryption & nullifiable commitments"],
                      ["Server Compromise", "Backdoored binary, tampering", "Deterministic Nix builds + SHA-256 attestation"],
                      ["Logic Exploits", "Integer overflow, edge cases in tally", "Formal verification (TLA+ / Coq proofs)"],
                      ["Identity Theft", "Stolen login credentials", "Passkeys (WebAuthn/FIDO2 — no passwords)"],
                      ["Adversarial ML", "Ink patterns that trick ballot scanners", "RobEns ensemble + feature squeezing"],
                      ["Screen Capture", "Malware recording ballot selection", "Visual cryptography (split-image shares)"],
                      ["Infrastructure Seizure", "Physical server confiscation", "BFT distributed consensus (global nodes)"],
                      ["Frontend Tampering", "CDN-injected malicious JavaScript", "IPFS-pinned content-addressed frontend"]
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-6 py-3 font-bold text-slate-900 border-b border-slate-200 text-sm">{row[0]}</td>
                        <td className="px-6 py-3 text-slate-700 border-b border-slate-200 text-sm">{row[1]}</td>
                        <td className="px-6 py-3 text-emerald-700 font-semibold border-b border-slate-200 text-sm">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section icon={MapPin} number="14" title="Geographic Access Control (ZK-ABAC)">
              <div id="section-14">
                <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                  Sacred.Vote rejects live telemetry (IP geolocation, browser GPS APIs) as a geographic restriction mechanism. IP tracking is neutralized by Tor/I2P onion routing, and client-side HTML5 GPS data is trivially spoofed via browser extensions. Furthermore, if the server learns the voter's location at the moment of voting, the anonymity mandate is destroyed. Sacred.Vote treats location as a <strong>cryptographic claim issued during enrollment</strong>, not a live telemetry feed.
                </p>

                <Card title="1. Deterministic Spatial Indexing (H3 Grid)" references={["Uber Engineering, 'H3: Uber Hexagonal Hierarchical Spatial Index,' 2018"]}>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Arbitrary human-drawn polygons (city limits, district lines) cannot be evaluated inside zero-knowledge cryptographic circuits due to computational complexity. Sacred.Vote utilizes <strong>Uber's H3 Hexagonal Hierarchical Spatial Index</strong>, which overlays the globe with a deterministic grid of hexagons at multiple resolutions, from continent-scale down to square meters.
                  </p>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    A physical precinct is translated by the administrative interface into an array of discrete H3 indices (e.g., <code className="font-mono text-sm bg-slate-100 px-1.5 py-0.5 rounded">892a10089dbffff</code>, <code className="font-mono text-sm bg-slate-100 px-1.5 py-0.5 rounded">892a10089cfffff</code>). This converts messy geographical borders into exact, mathematically provable strings suitable for zk-SNARK circuit evaluation.
                  </p>
                </Card>

                <Card title="2. Out-of-Band Material Binding (Enrollment)" references={["Chaum, D., 'Blind Signatures for Untraceable Payments,' Crypto 1982"]}>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    A voter's location is verified exactly once, in material reality, before any digital token is issued. During the double-blind registration phase, the Gatekeeper physically or forensically verifies the voter's address via utility bill, tax record, or organizational roster.
                  </p>
                  <ParamList items={[
                    "The Gatekeeper converts the verified address into a high-resolution H3 index",
                    "The Gatekeeper signs a hidden token embedding the H3 index and demographic attributes (e.g., Age >= 18, Union_Member = True)",
                    "The payload is signed blindly: the server holds no record mapping phonetic identity to the generated token",
                    "The token exists only in the voter's local hardware enclave (Secure Enclave / TPM)"
                  ]} />
                </Card>

                <Card title="3. Client-Side Policy Evaluation (zk-SNARK Circuit)" references={["Groth, J., 'On the Size of Pairing-Based Non-interactive Arguments,' EUROCRYPT 2016"]}>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    The server never enforces access by requesting the voter's attributes. The server broadcasts requirements and demands a mathematical proof of eligibility.
                  </p>
                  <div className="bg-white rounded-lg p-6 border border-slate-200 mb-4">
                    <p className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Protocol Sequence</p>
                    <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
                      <li>The administrator creates an election and publishes an <strong>Access Policy</strong> to the IPFS ledger (e.g., "Must possess Gatekeeper signature for H3 Index array X AND attribute Y")</li>
                      <li>The voter's local client downloads this policy</li>
                      <li>The voter's browser executes a local <strong>zk-SNARK circuit</strong> that checks whether the locally held token satisfies the downloaded policy</li>
                      <li>If true, the circuit generates a "Proof of Eligibility" and encrypts the ballot</li>
                      <li>The Gatekeeper receives an encrypted vote and a proof stating "this voter belongs to the required precinct" without learning which voter submitted it</li>
                    </ol>
                  </div>
                </Card>

                <Card title="4. Intersection Vulnerability & k-Anonymity Enforcement" references={["Sweeney, L., 'k-Anonymity: A Model for Protecting Privacy,' International Journal of Uncertainty, Fuzziness and Knowledge-Based Systems, 2002"]}>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Highly granular geographic targeting introduces a <strong>de-anonymization vector via intersection</strong>. If an election is restricted to a single city block AND requires a specific attribute (e.g., a particular ancestry or profession), the eligible anonymity set may collapse to a single individual. Even with homomorphic tallying, if only one person is eligible, the published tally reveals their exact choice.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-4">
                    <p className="text-sm font-bold text-amber-800 mb-2">Mandatory Safeguard: Minimum Anonymity Set</p>
                    <p className="text-amber-900 text-sm leading-relaxed">
                      The voting smart contract enforces a <strong>minimum anonymity set (k-anonymity threshold)</strong>. The administrative interface performs a census check and refuses to initialize any election where the mathematical intersection of targeted geo-attributes yields a potential voter pool below a safe threshold (e.g., k = 50).
                    </p>
                  </div>
                </Card>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left" aria-label="Geographic Access Control Comparison Matrix">
                    <caption className="sr-only">Comparison of hegemonic access control methods versus Sacred.Vote forensic protocols for geographic restriction</caption>
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th scope="col" className="px-6 py-3 font-bold text-sm">Control Layer</th>
                        <th scope="col" className="px-6 py-3 font-bold text-sm">Hegemonic Method</th>
                        <th scope="col" className="px-6 py-3 font-bold text-sm">Sacred.Vote Forensic Protocol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Geo-Fencing", "IP Geolocation / Browser GPS", "H3 Hexagonal Spatial Indexing"],
                        ["Verification", "Live Telemetry Check", "Out-of-Band Material Enrollment"],
                        ["Access Logic", "Server-Side Database Query", "Client-Side zk-SNARK Policy Evaluation"],
                        ["Privacy Guard", "Corporate 'Trust Us' Policy", "Mandatory k-Anonymity Thresholds"],
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="px-6 py-3 font-bold text-slate-900 border-b border-slate-200 text-sm">{row[0]}</td>
                          <td className="px-6 py-3 text-slate-700 border-b border-slate-200 text-sm">{row[1]}</td>
                          <td className="px-6 py-3 text-emerald-700 font-semibold border-b border-slate-200 text-sm">{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 p-8 rounded-2xl border border-slate-200 bg-slate-50"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">Audit Methodology</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              All systems are modeled under the assumption that the network is compromised, the server is under surveillance, and endpoints may be infected. Reliability is derived strictly from mathematical proofs, hardware-rooted attestation, and distributed cryptographic quorums. Security is an emergent property of the mathematics, not a claim requiring trust.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Sacred.Vote is free and open-source software (FOSS). The complete source code, formal verification proofs, and build manifests are publicly available for independent audit.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 p-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-blue-50 to-slate-50"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">Engineered & Maintained by PlausiDen</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sacred.Vote is engineered and maintained by <a href="https://plausiden.com" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline" data-testid="link-plausiden-specs">PlausiDen</a>. PlausiDen is responsible for the design, development, and ongoing maintenance of the Sacred.Vote platform, including all cryptographic implementations, infrastructure, and security architecture documented on this page.
            </p>
            <p className="text-slate-700 leading-relaxed">
              If you identify any issues with the content, technical specifications, or cited sources on this page, please notify PlausiDen directly at <a href="https://plausiden.com" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline" data-testid="link-plausiden-contact">PlausiDen.com</a>.
            </p>
          </motion.div>

          <div id="section-15">
            <Section icon={Shield} number="15" title="Zero-Trust Infrastructure">
              <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                Zero-Trust is a security model that eliminates the concept of implicit trust from any interaction, regardless of whether it originates inside or outside a network perimeter. Under NIST SP 800-207, the definitive federal standard, no user, device, or network segment is inherently trusted — every request must be authenticated, authorized, and continuously validated before access is granted to any resource.
              </p>

              <Card
                title="Foundational Principles: NIST SP 800-207"
                references={[
                  "NIST SP 800-207: Zero Trust Architecture (2020) — csrc.nist.gov/pubs/sp/800/207/final",
                  "Kindervag, J., 'No More Chewy Centers: Introducing The Zero Trust Model Of Information Security,' Forrester Research, 2010",
                  "CISA Zero Trust Maturity Model v2.0 (2023) — cisa.gov/zero-trust-maturity-model"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  The traditional perimeter-based security model assumes that everything inside a network boundary is safe. This assumption is catastrophically invalid in modern environments where nation-state adversaries, malicious insiders, and supply-chain compromises are routine. John Kindervag's Zero-Trust model (Forrester, 2010), later formalized by NIST, replaces this with a single axiom:
                </p>
                <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-6 mb-4">
                  <p className="font-serif text-lg font-bold text-slate-900 italic">
                    "Never trust, always verify."
                  </p>
                  <p className="text-sm text-slate-600 mt-2">— NIST SP 800-207 core principle</p>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">
                  NIST identifies seven tenets of Zero Trust that Sacred.Vote implements across the entire voting lifecycle:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li><strong>All data sources and computing services are considered resources.</strong> No network location confers implicit access.</li>
                  <li><strong>All communication is secured regardless of network location.</strong> End-to-end encryption (TLS 1.3 + post-quantum hybrid) applies to all traffic, including internal service-to-service calls.</li>
                  <li><strong>Access to individual enterprise resources is granted on a per-session basis.</strong> Authentication is not cached across sessions; every voting session requires fresh hardware attestation.</li>
                  <li><strong>Access to resources is determined by dynamic policy.</strong> CARTA-based risk scoring applies to every access decision, factoring in hardware token state, behavioral signals, and cryptographic freshness.</li>
                  <li><strong>The enterprise monitors and measures the integrity and security posture of all owned and associated assets.</strong> Continuous telemetry from hardware attestation certificates and Merkle audit logs.</li>
                  <li><strong>All resource authentication and authorization are dynamic and strictly enforced before access is allowed.</strong> ML-DSA post-quantum signatures validated on every ballot submission.</li>
                  <li><strong>The enterprise collects as much information as possible about the current state of assets, network infrastructure, and communications.</strong> Immutable Merkle Mountain Range audit trail published to IPFS.</li>
                </ol>
              </Card>

              <Card
                title="Elliptic Curve Cryptography as the Sole Primitive"
                references={[
                  "Bernstein, D.J. & Lange, T., 'SafeCurves: Choosing Safe Curves for Elliptic-Curve Cryptography,' 2013 — safecurves.cr.yp.to",
                  "NIST FIPS 186-5: Digital Signature Standard (DSS), 2023",
                  "SEC 2: Recommended Elliptic Curve Domain Parameters, Certicom Research, 2010"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Sacred.Vote restricts all classical cryptographic operations to Elliptic Curve Cryptography (ECC). RSA and Diffie-Hellman over multiplicative groups are prohibited because their security relies on the hardness of integer factorization and discrete logarithms over finite fields — problems efficiently solvable by Shor's algorithm on a sufficiently powerful quantum computer.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  ECC provides equivalent security to RSA with dramatically smaller key sizes, reducing attack surface:
                </p>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left p-3 border border-slate-200 font-bold">Algorithm</th>
                        <th className="text-left p-3 border border-slate-200 font-bold">Security Level</th>
                        <th className="text-left p-3 border border-slate-200 font-bold">Key Size</th>
                        <th className="text-left p-3 border border-slate-200 font-bold">Quantum Safe?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["RSA-2048", "112 bits", "2048 bits", "No"],
                        ["RSA-4096", "140 bits", "4096 bits", "No"],
                        ["P-256 (ECC)", "128 bits", "256 bits", "Partial (until Shor)"],
                        ["Curve25519 (ECC)", "128 bits", "256 bits", "Partial (until Shor)"],
                        ["ML-DSA-65 (Dilithium)", "Category 3", "2,528 bytes", "Yes — NIST PQC standard"],
                      ].map(([alg, sec, key, qsafe], i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="p-3 border border-slate-200 font-mono text-xs">{alg}</td>
                          <td className="p-3 border border-slate-200">{sec}</td>
                          <td className="p-3 border border-slate-200 font-mono text-xs">{key}</td>
                          <td className={`p-3 border border-slate-200 font-bold ${qsafe === "No" ? "text-red-600" : qsafe.startsWith("Yes") ? "text-emerald-600" : "text-amber-600"}`}>{qsafe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Sacred.Vote deploys ECC for legacy-compatible operations (Curve25519 / P-256 for session initiation) and immediately hybridizes with ML-KEM (Kyber-768) and ML-DSA (Dilithium-3) for all ballot-critical operations, achieving defense in depth: an adversary must simultaneously break both ECC discrete logarithm and lattice reduction problems to compromise a single ballot.
                </p>
              </Card>

              <Card
                title="Micro-Segmentation and Assumed Breach Posture"
                references={[
                  "CISA: Zero Trust Maturity Model, Version 2.0 (2023)",
                  "Rose, S. et al., 'Zero Trust Architecture,' NIST SP 800-207 (2020)",
                  "Microsoft: Zero Trust Deployment Guide (2023) — microsoft.com/security/business/zero-trust"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Sacred.Vote's infrastructure is partitioned into cryptographically isolated segments with no lateral movement possible between them. The assumed breach posture means the system is designed to operate correctly even when one or more components are fully compromised:
                </p>
                <div className="space-y-3 mb-4">
                  {[
                    { zone: "Voter Layer", desc: "Client browser; holds only the voter's local keypair and receives only encrypted poll state. Cannot access any server-side data or other voter records." },
                    { zone: "Gatekeeper Layer", desc: "Issues blind-signed tokens after hardware attestation. Cryptographically prevented from learning which poll option a voter chose — sees only that a valid token was consumed." },
                    { zone: "Tallier Layer", desc: "Receives only homomorphically encrypted ballots. Cannot decrypt individual votes even with full database access — decryption requires a k-of-n trustee quorum." },
                    { zone: "Trustee Layer", desc: "Distributed across independent jurisdictions. No single trustee holds a complete decryption key. Trustees communicate only during the sealed tallying window." },
                    { zone: "Audit Layer", desc: "Append-only Merkle Mountain Range published to IPFS. Receives cryptographic commitments only — never receives raw vote data." },
                  ].map((seg, i) => (
                    <div key={i} className="p-4 rounded-lg border-l-4 border-primary bg-blue-50/50">
                      <span className="font-bold text-slate-900">{seg.zone}: </span>
                      <span className="text-slate-700 text-sm">{seg.desc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Even if an adversary achieves complete control of the Tallier Layer, they receive only an encrypted aggregate ciphertext. Ballot integrity and voter anonymity are preserved by the mathematics of homomorphic encryption, not by network security that can be defeated.
                </p>
              </Card>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-blue-100 border border-primary/20 flex items-start gap-4">
                <ExternalLink className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-slate-900 mb-2">Primary Reference</p>
                  <a
                    href="https://csrc.nist.gov/pubs/sp/800/207/final"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 font-mono text-sm hover:text-primary/80 transition-colors"
                    data-testid="link-nist-zero-trust"
                  >
                    NIST SP 800-207: Zero Trust Architecture — csrc.nist.gov/pubs/sp/800/207/final
                  </a>
                  <p className="text-slate-600 text-sm mt-2">Published by the National Institute of Standards and Technology. The authoritative U.S. federal standard defining Zero Trust Architecture principles, components, and deployment models.</p>
                </div>
              </div>
            </Section>
          </div>

          <div id="section-16">
            <Section icon={Lock} number="16" title="Strict Role-Based Access Control (RBAC)">
              <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                Role-Based Access Control (RBAC) is a security paradigm in which system access privileges are assigned to roles rather than directly to individual users. Users acquire permissions by being assigned to roles, and roles are defined by the set of operations they are permitted to perform. NIST RBAC (NIST IR 7316) defines a four-level model ranging from flat RBAC to constrained RBAC with separation-of-duty enforcement.
              </p>

              <Card
                title="NIST RBAC Model Hierarchy"
                references={[
                  "Sandhu, R. et al., 'Role-Based Access Control Models,' IEEE Computer, 1996",
                  "NIST IR 7316: Assessment of Access Control Systems (2006) — nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir7316.pdf",
                  "Ferraiolo, D. et al., 'Proposed NIST Standard for Role-Based Access Control,' ACM TISSEC, 2001"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  The NIST RBAC model defines four increasingly sophisticated levels:
                </p>
                <div className="space-y-3 mb-4">
                  {[
                    { level: "RBAC0 — Core RBAC", desc: "Users, roles, permissions, and sessions. A user can activate multiple roles in a session; permissions are associated with roles, not users." },
                    { level: "RBAC1 — Hierarchical RBAC", desc: "Roles inherit permissions from senior roles. A SuperAdmin role inherits all permissions of Admin, which inherits all permissions of Operator." },
                    { level: "RBAC2 — Constrained RBAC", desc: "Adds Separation of Duty (SoD) constraints. Mutually exclusive roles cannot be assigned to the same user — a Trustee cannot also be an Administrator." },
                    { level: "RBAC3 — Symmetric RBAC", desc: "Combines hierarchical inheritance with SoD constraints. The complete model used in high-assurance systems including voting infrastructure." },
                  ].map((level, i) => (
                    <div key={i} className="p-4 rounded-lg border border-slate-200 bg-white">
                      <p className="font-bold text-primary text-sm mb-1">{level.level}</p>
                      <p className="text-slate-700 text-sm">{level.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Sacred.Vote implements RBAC3 with SoD enforcement. The system enforces that no single identity can hold conflicting roles simultaneously — a design that prevents any single actor from compromising both the issuance and tallying phases of an election.
                </p>
              </Card>

              <Card
                title="Sacred.Vote Role Model"
                references={[
                  "OWASP Access Control Cheat Sheet — owasp.org/www-project-cheat-sheets",
                  "Ferraiolo, D. & Kuhn, D.R., 'Role-Based Access Controls,' 15th National Computer Security Conference (NCSC), 1992"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Six distinct roles are defined with strictly non-overlapping permission sets. Each role is bound to a hardware-attested credential and cannot be escalated without multi-party authorization:
                </p>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left p-3 border border-slate-200 font-bold">Role</th>
                        <th className="text-left p-3 border border-slate-200 font-bold">Capabilities</th>
                        <th className="text-left p-3 border border-slate-200 font-bold">Cannot Do</th>
                        <th className="text-left p-3 border border-slate-200 font-bold">Auth Requirement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Voter", "Cast one encrypted ballot, verify receipt inclusion", "See other ballots, access tally, modify poll", "Hardware SE + ZKP"],
                        ["Gatekeeper", "Issue blind tokens, verify hardware attestation", "See ballot content, access tally, decrypt anything", "FIPS 140-3 HSM"],
                        ["Trustee", "Participate in threshold decryption quorum", "Access individual ballots, modify poll, issue tokens", "Air-gapped hardware key"],
                        ["Administrator", "Create polls, configure eligibility rules", "Decrypt ballots, issue tokens, participate in tally", "Multi-party MPC approval"],
                        ["Auditor", "Read Merkle commitments, verify proofs, read audit log", "Write any system state, access identity data", "Signed certificate, read-only"],
                        ["Witness", "Countersign audit publications, flag anomalies", "Modify any system state, access voter data", "Independent jurisdiction credential"],
                      ].map(([role, can, cannot, auth], i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="p-3 border border-slate-200 font-bold text-primary">{role}</td>
                          <td className="p-3 border border-slate-200 text-xs">{can}</td>
                          <td className="p-3 border border-slate-200 text-xs text-red-700">{cannot}</td>
                          <td className="p-3 border border-slate-200 text-xs font-mono">{auth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card
                title="Separation of Duty (SoD) Enforcement"
                references={[
                  "Clark, D.D. & Wilson, D.R., 'A Comparison of Commercial and Military Computer Security Policies,' IEEE Symposium on Security and Privacy, 1987",
                  "Sandhu, R., 'Separation of Duty in Computerized Information Systems,' IFIP WG 11.3 Database Security, 1990"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Separation of Duty is a control mechanism that ensures no single individual can execute a complete, sensitive transaction unilaterally. It is the digital equivalent of the two-person rule used in nuclear launch authorization and bank dual-control procedures.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Sacred.Vote enforces two categories of SoD:
                </p>
                <div className="space-y-3 mb-4">
                  <div className="p-4 rounded-lg border border-slate-200 bg-amber-50">
                    <p className="font-bold text-slate-900 mb-2">Static SoD (assignment-time constraint)</p>
                    <p className="text-slate-700 text-sm">A user assigned to the Trustee role cannot simultaneously hold the Gatekeeper or Administrator role. This is enforced at credential issuance time by a multi-party ceremony that cryptographically binds roles to hardware tokens.</p>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-200 bg-blue-50">
                    <p className="font-bold text-slate-900 mb-2">Dynamic SoD (activation-time constraint)</p>
                    <p className="text-slate-700 text-sm">During an active election session, the Auditor role cannot be activated by any user who has already activated the Administrator role in the same session, even if their credential technically permits both. The enforcement is cryptographic: role activation tokens are mutually exclusive and non-transferable.</p>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  The practical effect is that colluding actors cannot concentrate sufficient authority to alter an election outcome without recruiting at least k of n trustees, which requires a globally distributed conspiracy detectable in the public audit log.
                </p>
              </Card>

              <Card
                title="Evolution to CARTA: When RBAC Is Not Enough"
                references={[
                  "Gartner: Continuous Adaptive Risk and Trust Assessment (CARTA) Framework",
                  "NIST SP 800-162: Guide to Attribute Based Access Control (ABAC) Definition and Considerations (2014)"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Classic RBAC assigns static permissions based on organizational roles. This model fails to account for contextual risk signals: a user holding valid credentials who is suddenly authenticating from an unfamiliar geography, using a different device fingerprint, or generating anomalous request patterns should have their access dynamically restricted despite holding a valid role assignment.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Sacred.Vote augments RBAC3 with CARTA's continuous adaptive assessment (documented in Section 9). Every access decision evaluates not just "what role does this credential hold?" but "what is the current risk score of this session, device, network origin, and behavioral pattern?" Roles define the ceiling of allowed access; CARTA dynamically applies the floor based on real-time risk.
                </p>
              </Card>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-blue-100 border border-primary/20 flex items-start gap-4">
                <ExternalLink className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-slate-900 mb-2">Primary References</p>
                  <div className="space-y-2">
                    <a
                      href="https://csrc.nist.gov/projects/role-based-access-control"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary underline underline-offset-2 font-mono text-sm hover:text-primary/80 transition-colors"
                      data-testid="link-nist-rbac"
                    >
                      NIST RBAC Project — csrc.nist.gov/projects/role-based-access-control
                    </a>
                    <a
                      href="https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir7316.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary underline underline-offset-2 font-mono text-sm hover:text-primary/80 transition-colors"
                      data-testid="link-nist-ir7316"
                    >
                      NIST IR 7316: Assessment of Access Control Systems (PDF) — nvlpubs.nist.gov
                    </a>
                  </div>
                  <p className="text-slate-600 text-sm mt-2">NIST's definitive documentation on RBAC models, formal definitions, and implementation guidance for high-assurance systems.</p>
                </div>
              </div>
            </Section>
          </div>

          <div id="section-17">
            <Section icon={Code2} number="17" title="FOSS-First Commitment">
              <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                Free and Open Source Software (FOSS) is software that grants users the freedom to run, study, modify, and distribute the software and its source code. For election systems specifically, FOSS is not merely a preference — it is an ethical and security requirement. A democratic institution cannot credibly claim that votes are counted correctly if the counting software is a black box that citizens are legally prohibited from inspecting.
              </p>

              <Card
                title="The Four Freedoms and Why They Matter for Elections"
                references={[
                  "Stallman, R.M., 'The GNU Project,' Free Software Foundation — gnu.org/gnu/thegnuproject.html",
                  "Free Software Definition, FSF — gnu.org/philosophy/free-sw.html",
                  "Open Source Definition, OSI — opensource.org/osd"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  The Free Software Foundation defines four fundamental freedoms that free software must guarantee. Richard Stallman's formulation, applied to election infrastructure:
                </p>
                <div className="space-y-3 mb-4">
                  {[
                    {
                      freedom: "Freedom 0 — Run for Any Purpose",
                      desc: "Any election authority, civic organization, academic researcher, or independent auditor must be able to deploy and run Sacred.Vote's software without restriction. No licensing fees, no vendor lock-in, no geographic exclusions."
                    },
                    {
                      freedom: "Freedom 1 — Study and Modify",
                      desc: "The complete source code must be publicly accessible so that cryptographers, security researchers, and adversarial reviewers can independently verify that the system functions as claimed. Secret source code in a voting system is an assertion of authority that democratic systems cannot accept."
                    },
                    {
                      freedom: "Freedom 2 — Redistribute Copies",
                      desc: "Any municipality may copy, redistribute, and deploy the software without legal restriction. This enables smaller jurisdictions without IT resources to benefit from security improvements made by larger organizations."
                    },
                    {
                      freedom: "Freedom 3 — Distribute Modified Versions",
                      desc: "Jurisdictions may adapt the software to local requirements and share improvements back to the community. Security patches discovered by a researcher in one jurisdiction benefit all deployments globally."
                    }
                  ].map((f, i) => (
                    <div key={i} className="p-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50/50">
                      <p className="font-bold text-slate-900 text-sm mb-1">{f.freedom}</p>
                      <p className="text-slate-700 text-sm">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card
                title="Reproducible Builds and Deterministic Compilation"
                references={[
                  "Reproducible Builds Project — reproducible-builds.org",
                  "Wheeler, D.A., 'Countering Trusting Trust through Diverse Double-Compiling (DDC),' ACSAC 2005",
                  "NixOS Foundation: Nix Flakes and Reproducible Development Environments — nixos.org"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Publishing source code alone is insufficient if the distributed binary cannot be verified to correspond to that source code. Ken Thompson's 1984 Turing Award lecture, "Reflections on Trusting Trust," demonstrated that a malicious compiler could insert backdoors that are invisible in source code inspection.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Sacred.Vote mandates <strong>reproducible builds</strong>: the build process is deterministic such that any auditor starting from the published source code, using the pinned toolchain, must arrive at a binary with an identical SHA-256 hash to the deployed production binary. This is verified through:
                </p>
                <div className="space-y-3 mb-4">
                  {[
                    { step: "Nix Flake Lockfile", desc: "All dependencies are pinned to cryptographic content hashes in flake.lock. No dependency can change without a corresponding hash change that appears in the public git history." },
                    { step: "Deterministic Build Pipeline", desc: "Build timestamps, filesystem ordering, and compiler output are normalized to eliminate sources of non-determinism. Two independent builds on two different machines produce byte-identical output." },
                    { step: "Binary Attestation", desc: "The production binary's SHA-256 hash is signed by the ML-DSA post-quantum key and published to the IPFS audit ledger. Querying /api/manifest returns the current hash for independent verification." },
                    { step: "Diverse Double-Compiling (DDC)", desc: "Critical cryptographic modules are compiled using two independently audited toolchains and the resulting binaries are compared. A mismatch indicates supply-chain compromise." },
                  ].map((s, i) => (
                    <div key={i} className="p-4 rounded-lg border border-slate-200 bg-white">
                      <p className="font-bold text-primary text-sm mb-1">{i + 1}. {s.step}</p>
                      <p className="text-slate-700 text-sm">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card
                title="The Belenios Foundation: Peer-Reviewed FOSS Election Software"
                references={[
                  "Cortier, V. et al., 'Belenios: A Simple Private and Verifiable Electronic Voting System,' INRIA Research Report RR-9365, 2021",
                  "Baloglu, S. et al., 'Provably Improving Belenios Verifiability,' IACR ePrint 2021/283",
                  "Belenios Project — belenios.org (INRIA, LORIA, CNRS)"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Sacred.Vote's cryptographic tallying layer is built upon <strong>Belenios</strong>, a voting system developed by researchers at INRIA, LORIA, and CNRS — France's national research institutions. Belenios has been formally analyzed, peer-reviewed in international cryptography conferences, and deployed in real-world elections across academic and governmental contexts.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Key FOSS properties of Belenios:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
                  <li>Complete source code published under LGPL license at <span className="font-mono text-sm">gitlab.inria.fr/belenios</span></li>
                  <li>Formally specified election verification protocol — any voter can independently verify their ballot was counted</li>
                  <li>Academic peer review trail spanning 10+ years of published cryptographic literature</li>
                  <li>Independent deployment by universities, research institutions, and civic organizations</li>
                  <li>Threshold decryption requiring multi-party trustee cooperation — no single deployment operator can manipulate results</li>
                </ul>
              </Card>

              <Card
                title="Public Audit Rights and Citizen Verification"
                references={[
                  "Verified Voting Foundation — verifiedvoting.org",
                  "Open Source Election Technology (OSET) Institute — osetfoundation.org",
                  "EAC: Voluntary Voting System Guidelines (VVSG) 2.0 — eac.gov/voting-equipment/voluntary-voting-system-guidelines"
                ]}
              >
                <p className="text-slate-700 leading-relaxed mb-4">
                  Every citizen who casts a ballot in Sacred.Vote is entitled to perform an independent audit of the election outcome. This is not a promised feature — it is a cryptographic guarantee that cannot be removed by administrators or vendors:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 ml-4">
                  <li><strong>Cast-as-intended verification:</strong> After submitting a ballot, the voter receives a cryptographic receipt containing the hash commitment of their encrypted vote. They can independently verify their encrypted ballot appears in the public ledger.</li>
                  <li><strong>Counted-as-cast verification:</strong> The voter's encrypted ballot must appear in the Merkle Mountain Range published to IPFS. A Merkle proof demonstrates inclusion without revealing the ballot content.</li>
                  <li><strong>Tallied-as-counted verification:</strong> The homomorphic tally operation is performed on publicly visible ciphertexts. Any auditor can independently execute the tally computation using the published ciphertexts and verify the result matches the published outcome.</li>
                  <li><strong>Eligibility verification:</strong> The anonymized set of issued tokens (without identity binding) is published. Third parties can verify that the number of cast ballots does not exceed the number of issued tokens.</li>
                </ol>
                <p className="text-slate-700 leading-relaxed mt-4">
                  These four verifiability properties together constitute <strong>end-to-end verifiability (E2E-V)</strong>, the gold standard for election integrity recognized by the U.S. Election Assistance Commission and international election observers.
                </p>
              </Card>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 flex items-start gap-4">
                <ExternalLink className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-slate-900 mb-2">Primary References</p>
                  <div className="space-y-2">
                    {[
                      { label: "GNU Free Software Definition", href: "https://www.gnu.org/philosophy/free-sw.html" },
                      { label: "Open Source Initiative (OSI) — opensource.org", href: "https://opensource.org" },
                      { label: "Reproducible Builds Project — reproducible-builds.org", href: "https://reproducible-builds.org" },
                      { label: "Belenios Voting System (INRIA) — belenios.org", href: "https://www.belenios.org" },
                      { label: "OSET Institute: Open Source Election Technology — osetfoundation.org", href: "https://osetfoundation.org" },
                    ].map((link, i) => (
                      <a
                        key={i}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary underline underline-offset-2 font-mono text-sm hover:text-primary/80 transition-colors"
                        data-testid={`link-foss-ref-${i}`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-blue-100 to-emerald-100 border-3 border-primary"
          >
            <div className="flex items-start gap-6">
              <ExternalLink className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Learn More: Belenios Verifiable Voting</h3>
                <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                  Sacred.Vote builds upon Belenios, a peer-reviewed, open-source voting system developed by INRIA, LORIA, and CNRS. Belenios is deployed globally in real elections and provides proven end-to-end verifiability and threshold decryption.
                </p>
                <a
                  href="https://www.belenios.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                  data-testid="link-belenios"
                >
                  Visit www.belenios.org
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
