import { useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useVoterSession } from "@/context/voter-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Download, Home, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function ReceiptPage() {
  const [, navigate] = useLocation();
  const { receipt, isAuthenticated } = useVoterSession();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated || !receipt) {
      window.location.href = "https://sacred.vote";
    }
  }, [isAuthenticated, receipt]);

  if (!receipt) return null;

  const handleDownload = () => {
    const content = [
      "=== SacredVote Official Receipt ===",
      "",
      `Timestamp: ${new Date(receipt.timestamp).toLocaleString()}`,
      `Poll: ${receipt.pollTitle || "Poll #" + receipt.pollId}`,
      `Option Selected: ${receipt.optionSelected}`,
      `Status: VERIFIED & LOGGED`,
      "",
      `Cryptographic Hash (SHA-256):`,
      receipt.receiptHash,
      "",
      "* Save this receipt. The hash is the only way to verify your vote was counted without revealing your choice.",
      "",
      "=== End of Receipt ===",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sacredvote-receipt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="flex-grow flex items-center justify-center p-4 bg-[#F0F4F8]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-none shadow-2xl overflow-hidden">
            <div className="bg-emerald-600 p-8 text-center text-white">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
              >
                <CheckCircle2 className="w-12 h-12 text-white" aria-hidden="true" />
              </motion.div>
              <h1 className="text-3xl font-serif font-bold mb-2" data-testid="text-vote-success">Vote Successfully Cast</h1>
              <p className="text-emerald-100 text-lg">Your ballot has been cryptographically secured.</p>
            </div>

            <CardContent className="p-8 bg-white">
              <div className="space-y-8">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Official Receipt
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Timestamp</div>
                        <div className="font-mono text-sm text-slate-800" data-testid="text-receipt-timestamp">{new Date(receipt.timestamp).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Status</div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                          VERIFIED & LOGGED
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <div className="text-xs text-slate-500 mb-2">Cryptographic Hash (SHA-256)</div>
                      <div 
                        className="bg-slate-900 text-emerald-400 font-mono text-xs md:text-sm p-4 rounded-lg break-all leading-relaxed select-all"
                        aria-label={`Cryptographic vote receipt hash: ${receipt.receiptHash}`}
                        data-testid="text-receipt-hash"
                      >
                        {receipt.receiptHash}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">
                        * Save this hash. It is the only way to verify your vote was counted without revealing your choice.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-200 hover:bg-slate-50"
                    onClick={() => {
                      navigator.clipboard.writeText(receipt.receiptHash);
                      toast({
                        title: "Copied",
                        description: "Receipt hash copied to clipboard.",
                      });
                    }}
                    data-testid="button-copy-hash"
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copy Hash
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-200 hover:bg-slate-50"
                    onClick={handleDownload}
                    data-testid="button-download-receipt"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Receipt
                  </Button>
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg"
                    onClick={() => navigate("/")}
                    data-testid="button-return-home"
                  >
                    <Home className="w-4 h-4 mr-2" /> Return Home
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
               <img 
                 src="https://pixabay.com/get/g27f253793e63a112be400e9f7d8bc39f33b424e1d3de1fbd5b34901f2fd7ecfef776c2d104b0734cdb836795b7878647fdee2acee8f57e3ff2d2436076210883_1280.jpg" 
                 alt="" 
                 className="h-8 mx-auto opacity-20 grayscale"
                 loading="lazy"
               />
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
