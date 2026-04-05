import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CreateEntryRequest {
    weight: number;
    waterGlasses: bigint;
    date: bigint;
    calories: bigint;
    mood: bigint;
    steps: bigint;
    sleepHours: number;
}
export interface Entry {
    weight: number;
    waterGlasses: bigint;
    date: bigint;
    calories: bigint;
    mood: bigint;
    steps: bigint;
    sleepHours: number;
}
export type Date_ = bigint;
export interface LogWorkoutRequest {
    date: bigint;
    name: string;
    reps: bigint;
    sets: bigint;
    weightKg: number;
    durationMinutes: bigint;
    notes: string;
}
export interface QueryWorkoutsRequest {
    endDate: bigint;
    startDate: bigint;
}
export interface QueryEntriesRequest {
    endDate: bigint;
    startDate: bigint;
}
export interface Workout {
    id: bigint;
    date: bigint;
    name: string;
    reps: bigint;
    sets: bigint;
    weightKg: number;
    durationMinutes: bigint;
    notes: string;
}
export interface UserProfile {
    name: string;
}
export interface Goals {
    targetSteps: bigint;
    targetCalories: bigint;
    targetSleepHours: number;
    targetWeight: number;
    targetWaterGlasses: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntry(request: CreateEntryRequest): Promise<void>;
    createGoals(goals: Goals): Promise<void>;
    deleteWorkout(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntry(date: Date_): Promise<Entry | null>;
    getGoals(): Promise<Goals>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkouts(date: bigint): Promise<Array<Workout>>;
    isCallerAdmin(): Promise<boolean>;
    logWorkout(request: LogWorkoutRequest): Promise<bigint>;
    queryEntries(request: QueryEntriesRequest): Promise<Array<Entry>>;
    queryWorkouts(request: QueryWorkoutsRequest): Promise<Array<Workout>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
