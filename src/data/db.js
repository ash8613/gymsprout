import Dexie from "dexie";
import exerciseDatabase from "./exercises.js";

const db = new Dexie("GymSproutDB");

db.version(1).stores({
  userProfile: "++id",
  exercises: "++id, name, muscleGroup, difficulty, equipment, isCustom",
  workouts: "++id, date, userId",
  workoutSets: "++id, workoutId, exerciseId",
  progressRecords: "++id, exerciseId, date",
});

/**
 * Seeds the exercises table with the full exercise database if it is empty.
 * Call this on app startup to ensure exercises are always available.
 * Returns the number of exercises added, or 0 if the table was already populated.
 */
async function seedExercises() {
  const count = await db.exercises.count();

  if (count > 0) {
    console.log(
      `Exercise database already populated with ${count} exercises. Skipping seed.`
    );
    return 0;
  }

  console.log(
    `Seeding exercise database with ${exerciseDatabase.length} exercises...`
  );

  await db.exercises.bulkAdd(exerciseDatabase);

  const newCount = await db.exercises.count();
  console.log(`Exercise database seeded successfully. Total: ${newCount}`);
  return newCount;
}

export { db, seedExercises };
export default db;
