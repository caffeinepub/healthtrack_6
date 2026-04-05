import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Entry = {
    date : Nat;
    steps : Nat;
    waterGlasses : Nat;
    sleepHours : Float;
    calories : Nat;
    weight : Float;
    mood : Nat;
  };

  public type Goals = {
    targetSteps : Nat;
    targetWaterGlasses : Nat;
    targetSleepHours : Float;
    targetCalories : Nat;
    targetWeight : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  public type Workout = {
    id : Nat;
    date : Nat;
    name : Text;
    sets : Nat;
    reps : Nat;
    weightKg : Float;
    durationMinutes : Nat;
    notes : Text;
  };

  public type CreateEntryRequest = {
    date : Nat;
    steps : Nat;
    waterGlasses : Nat;
    sleepHours : Float;
    calories : Nat;
    weight : Float;
    mood : Nat;
  };

  public type LogWorkoutRequest = {
    date : Nat;
    name : Text;
    sets : Nat;
    reps : Nat;
    weightKg : Float;
    durationMinutes : Nat;
    notes : Text;
  };

  public type QueryEntriesRequest = {
    startDate : Nat;
    endDate : Nat;
  };

  public type QueryWorkoutsRequest = {
    startDate : Nat;
    endDate : Nat;
  };

  type UserId = Principal;
  public type Date = Nat;

  let DEFAULT_GOALS : Goals = {
    targetSteps = 20000;
    targetWaterGlasses = 8;
    targetSleepHours = 8.0;
    targetCalories = 2000;
    targetWeight = 70.0;
  };

  // User data storage
  let userEntries = Map.empty<UserId, List.List<Entry>>();
  let userWorkouts = Map.empty<UserId, List.List<Workout>>();
  let userGoals = Map.empty<UserId, Goals>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextWorkoutId = 1;

  // Auto-register a non-anonymous caller as a user if not yet registered.
  // This ensures users who skipped or failed _initializeAccessControlWithSecret
  // can still use the app without being locked out.
  func ensureRegistered(caller : Principal) {
    if (caller.isAnonymous()) { return };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) {
        accessControlState.userRoles.add(caller, #user);
      };
      case (?_) {};
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot save profiles");
    };
    ensureRegistered(caller);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createEntry(request : CreateEntryRequest) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot create entries");
    };
    ensureRegistered(caller);

    if (request.mood < 1 or request.mood > 5) {
      Runtime.trap("Mood must be between 1 and 5");
    };

    let newEntry : Entry = {
      date = request.date;
      steps = request.steps;
      waterGlasses = request.waterGlasses;
      sleepHours = request.sleepHours;
      calories = request.calories;
      weight = request.weight;
      mood = request.mood;
    };

    let entries = switch (userEntries.get(caller)) {
      case (null) { List.empty<Entry>() };
      case (?existingEntries) {
        existingEntries.filter(func(e) { e.date != request.date });
      };
    };

    entries.add(newEntry);
    userEntries.add(caller, entries);
  };

  public query ({ caller }) func queryEntries(request : QueryEntriesRequest) : async [Entry] {
    switch (userEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        entries.filter(
          func(entry) {
            entry.date >= request.startDate and entry.date <= request.endDate;
          }
        ).toArray();
      };
    };
  };

  public shared ({ caller }) func logWorkout(request : LogWorkoutRequest) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot log workouts");
    };
    ensureRegistered(caller);

    let workoutId = nextWorkoutId;
    nextWorkoutId += 1;

    let newWorkout : Workout = {
      id = workoutId;
      date = request.date;
      name = request.name;
      sets = request.sets;
      reps = request.reps;
      weightKg = request.weightKg;
      durationMinutes = request.durationMinutes;
      notes = request.notes;
    };

    let existingWorkouts = switch (userWorkouts.get(caller)) {
      case (null) { List.empty<Workout>() };
      case (?workouts) { workouts };
    };
    existingWorkouts.add(newWorkout);
    userWorkouts.add(caller, existingWorkouts);

    workoutId;
  };

  public query ({ caller }) func getWorkouts(date : Nat) : async [Workout] {
    switch (userWorkouts.get(caller)) {
      case (null) { [] };
      case (?workouts) {
        workouts.filter(
          func(workout) { workout.date == date }
        ).toArray();
      };
    };
  };

  public query ({ caller }) func queryWorkouts(request : QueryWorkoutsRequest) : async [Workout] {
    switch (userWorkouts.get(caller)) {
      case (null) { [] };
      case (?workouts) {
        workouts.filter(
          func(workout) {
            workout.date >= request.startDate and workout.date <= request.endDate;
          }
        ).toArray();
      };
    };
  };

  public shared ({ caller }) func deleteWorkout(id : Nat) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot delete workouts");
    };

    switch (userWorkouts.get(caller)) {
      case (null) { Runtime.trap("Workout not found") };
      case (?workouts) {
        let filteredWorkouts = workouts.filter(
          func(w) { w.id != id }
        );
        let count = filteredWorkouts.size();
        if (count == workouts.size()) {
          Runtime.trap("Workout not found");
        };
        userWorkouts.add(caller, filteredWorkouts);
      };
    };
  };

  public shared ({ caller }) func createGoals(goals : Goals) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot create goals");
    };
    ensureRegistered(caller);
    userGoals.add(caller, goals);
  };

  // Returns user's goals, or default goals if none have been set yet
  public query ({ caller }) func getGoals() : async Goals {
    switch (userGoals.get(caller)) {
      case (null) { DEFAULT_GOALS };
      case (?goals) { goals };
    };
  };

  // Returns the entry for the given date, or null if none exists
  public query ({ caller }) func getEntry(date : Date) : async ?Entry {
    switch (userEntries.get(caller)) {
      case (null) { null };
      case (?entries) {
        entries.filter(func(e) { e.date == date }).first();
      };
    };
  };
};
