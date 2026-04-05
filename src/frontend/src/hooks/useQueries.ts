import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateEntryRequest,
  Entry,
  Goals,
  LogWorkoutRequest,
  UserProfile,
  Workout,
} from "../backend";
import { useActor } from "./useActor";

export function getToday(): bigint {
  return BigInt(Math.floor(Date.now() / 86400000));
}

export const DEFAULT_GOALS: Goals = {
  targetSteps: BigInt(20000),
  targetCalories: BigInt(2000),
  targetSleepHours: 8,
  targetWeight: 70,
  targetWaterGlasses: BigInt(8),
};

export function useTodayEntry() {
  const { actor, isFetching } = useActor();
  const today = getToday();
  return useQuery<Entry | null>({
    queryKey: ["entry", today.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getEntry(today);
        // backend returns Entry | null (optional)
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGoals() {
  const { actor, isFetching } = useActor();
  return useQuery<Goals>({
    queryKey: ["goals"],
    queryFn: async () => {
      if (!actor) return DEFAULT_GOALS;
      try {
        return await actor.getGoals();
      } catch {
        return DEFAULT_GOALS;
      }
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEFAULT_GOALS,
  });
}

export function useRecentEntries(days = 7) {
  const { actor, isFetching } = useActor();
  return useQuery<Entry[]>({
    queryKey: ["entries", days],
    queryFn: async () => {
      if (!actor) return [];
      const endDate = getToday();
      const startDate = endDate - BigInt(days - 1);
      return await actor.queryEntries({ startDate, endDate });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateEntryRequest) => {
      if (!actor) throw new Error("Not connected");
      await actor.createEntry(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entry"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useCreateGoals() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goals: Goals) => {
      if (!actor) throw new Error("Not connected");
      await actor.createGoals(goals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useWorkouts(date?: bigint) {
  const { actor, isFetching } = useActor();
  const targetDate = date ?? getToday();
  return useQuery<Workout[]>({
    queryKey: ["workouts", targetDate.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getWorkouts(targetDate);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecentWorkouts(days = 14) {
  const { actor, isFetching } = useActor();
  return useQuery<Workout[]>({
    queryKey: ["workouts", "range", days],
    queryFn: async () => {
      if (!actor) return [];
      const endDate = getToday();
      return await actor.queryWorkouts({
        startDate: endDate - BigInt(days - 1),
        endDate,
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: LogWorkoutRequest) => {
      if (!actor) throw new Error("Not connected");
      return await actor.logWorkout(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useDeleteWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteWorkout(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}
