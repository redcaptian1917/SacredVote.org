import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreatePollRequest } from "@shared/routes";
import { z } from "zod";

export function usePolls() {
  return useQuery({
    queryKey: [api.polls.list.path],
    queryFn: async () => {
      console.log(`[DEBUG] [usePolls] CMS fetching active polls...`);
      const res = await fetch(api.polls.list.path);
      if (!res.ok) {
        console.error(`[DEBUG] [usePolls] CMS fetch failed: ${res.status}`);
        throw new Error("Failed to fetch polls");
      }
      const data = api.polls.list.responses[200].parse(await res.json());
      console.log(`[DEBUG] [usePolls] SUCCESS: CMS loaded ${data.length} polls.`);
      return data;
    },
  });
}

export function usePoll(id: number) {
  return useQuery({
    queryKey: [api.polls.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      console.log(`[DEBUG] [usePoll] CMS fetching poll ID: ${id}`);
      const url = buildUrl(api.polls.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) {
        console.warn(`[DEBUG] [usePoll] Poll ID ${id} NOT FOUND.`);
        return null;
      }
      if (!res.ok) {
        console.error(`[DEBUG] [usePoll] CMS fetch failed: ${res.status}`);
        throw new Error("Failed to fetch poll");
      }
      const data = api.polls.get.responses[200].parse(await res.json());
      console.log(`[DEBUG] [usePoll] SUCCESS: CMS loaded poll "${data.title}"`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePollRequest) => {
      console.log(`[DEBUG] [useCreatePoll] CMS creating new poll: "${data.title}"`);
      const res = await fetch(api.polls.create.path, {
        method: api.polls.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.polls.create.responses[400].parse(await res.json());
          console.warn(`[DEBUG] [useCreatePoll] Validation failure: ${error.message}`);
          throw new Error(error.message);
        }
        console.error(`[DEBUG] [useCreatePoll] CMS creation failed: ${res.status}`);
        throw new Error("Failed to create poll");
      }
      const result = api.polls.create.responses[201].parse(await res.json());
      console.log(`[DEBUG] [useCreatePoll] SUCCESS: CMS created poll ID: ${result.id}`);
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.polls.list.path] }),
  });
}
