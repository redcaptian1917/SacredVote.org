import { useMutation } from "@tanstack/react-query";
import { api, type CastVoteRequest, type VerifyVoterRequest } from "@shared/routes";

export function useVerifyVoter() {
  return useMutation({
    mutationFn: async (data: VerifyVoterRequest) => {
      const res = await fetch(api.voters.verify.path, {
        method: api.voters.verify.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Verification failed");
      }
      
      return api.voters.verify.responses[200].parse(await res.json());
    },
  });
}

export function useCastVote() {
  return useMutation({
    mutationFn: async (data: CastVoteRequest) => {
      const res = await fetch(api.votes.cast.path, {
        method: api.votes.cast.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) throw new Error("Invalid vote data");
        if (res.status === 401) throw new Error("Unauthorized voter ID");
        if (res.status === 409) throw new Error("This voter has already cast a ballot");
        throw new Error("Failed to cast vote");
      }

      return api.votes.cast.responses[201].parse(await res.json());
    },
  });
}
