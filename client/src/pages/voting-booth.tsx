import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { DecoyForms } from "@/components/decoy-forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePolls } from "@/hooks/use-polls";
import { useCastVote } from "@/hooks/use-votes";
import { useVoterSession } from "@/context/voter-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Lock, Vote } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

function announce(message: string) {
  const el = document.getElementById("vote-announcer");
  if (el) {
    el.textContent = "";
    requestAnimationFrame(() => { el.textContent = message; });
  }
}

export default function VotingBoothPage() {
  const [, navigate] = useLocation();
  const { voterId, isAuthenticated, setReceipt } = useVoterSession();
  const { data: polls, isLoading: pollsLoading } = usePolls();
  const voteMutation = useCastVote();
  const { toast } = useToast();
  
  const [selectedPollId, setSelectedPollId] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "https://sacred.vote";
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (polls && polls.length > 0 && selectedPollId === null) {
      setSelectedPollId(polls[0].id);
    }
  }, [polls, selectedPollId]);

  const currentPoll = polls?.find(p => p.id === selectedPollId);

  const handleCastVote = async () => {
    if (!currentPoll || !selectedOption || !voterId) return;

    try {
      const receipt = await voteMutation.mutateAsync({
        pollId: currentPoll.id,
        optionSelected: selectedOption,
        voterId: voterId
      });
      
      announce("Your vote has been successfully cast and cryptographically secured.");
      setReceipt(receipt);
      navigate("/receipt");
    } catch (error: any) {
      const message = error?.message || "An unexpected error occurred while casting your vote.";
      announce("Vote submission failed. " + message);
      toast({
        title: "Vote Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (pollsLoading || !polls) {
    return (
      <Layout>
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-mono text-sm">Initializing Secure Booth...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (polls.length === 0) {
    return (
      <Layout>
        <div className="flex-grow flex items-center justify-center">
          <Card className="p-8 max-w-lg text-center">
            <h2 className="text-xl font-bold mb-2">No Active Polls</h2>
            <p className="text-slate-600">There are currently no active measures available for voting.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <DecoyForms />
      <div className="flex-grow bg-[#F0F4F8] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-8 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-slate-500" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voter Session</div>
                <div className="font-mono text-sm text-primary font-medium" data-testid="text-voter-session">ID: ••••-••••-{voterId?.slice(-4)}</div>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              BOOTH ACTIVE
            </div>
          </div>

          {polls.length > 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Vote className="w-4 h-4" aria-hidden="true" />
                Select a Poll
              </h3>
              <div className="grid gap-3">
                {polls.map((poll) => (
                  <button
                    key={poll.id}
                    onClick={() => {
                      setSelectedPollId(poll.id);
                      setSelectedOption(null);
                    }}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedPollId === poll.id
                        ? "border-primary bg-blue-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    data-testid={`button-select-poll-${poll.id}`}
                    aria-pressed={selectedPollId === poll.id}
                  >
                    <div className="font-semibold text-slate-900">{poll.title}</div>
                    <div className="text-sm text-slate-500 mt-1 line-clamp-1">{poll.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentPoll && (
            <motion.div
              key={currentPoll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden border-t-4 border-t-primary shadow-lg">
                <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-100">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4">
                    {currentPoll.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {currentPoll.description}
                  </p>
                </div>
                
                <CardContent className="p-6 md:p-8 bg-white">
                  <RadioGroup 
                    onValueChange={setSelectedOption} 
                    value={selectedOption || ""}
                    className="space-y-4"
                  >
                    {currentPoll.options.map((option, idx) => (
                      <Label
                        key={idx}
                        htmlFor={`option-${idx}`}
                        className={`
                          flex items-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                          ${selectedOption === option 
                            ? "border-primary bg-blue-50/50 shadow-md ring-1 ring-primary/20" 
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }
                        `}
                      >
                        <RadioGroupItem value={option} id={`option-${idx}`} className="sr-only" />
                        <div className={`
                          w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 transition-colors
                          ${selectedOption === option ? "border-primary bg-primary" : "border-slate-300"}
                        `}>
                          {selectedOption === option && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <span className={`text-lg font-medium ${selectedOption === option ? "text-primary" : "text-slate-700"}`}>
                          {option}
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>

                <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
                  <Button
                    size="lg"
                    onClick={handleCastVote}
                    disabled={!selectedOption || voteMutation.isPending}
                    className="bg-accent hover:bg-accent/90 text-white font-semibold text-lg px-8 h-14 rounded-lg shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5"
                    data-testid="button-cast-vote"
                  >
                    {voteMutation.isPending ? (
                       <>Processing Encryption...</> 
                    ) : (
                       <>Cast Secure Vote</>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
          
          <p className="text-center text-slate-400 text-sm mt-8 max-w-lg mx-auto leading-relaxed">
            By casting this vote, you certify that you are the registered owner of the Voter ID provided. 
            All actions are logged with a cryptographic timestamp.
          </p>
        </div>
      </div>
    </Layout>
  );
}
