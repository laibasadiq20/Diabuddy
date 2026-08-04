/**
 * Manual exercise logs used to set fitbitLogId: null. Combined with a sparse
 * unique index, MongoDB only allowed one such row per user — later creates failed.
 * Clear null ids and replace the bad index with a partial unique index.
 */
async function repairExerciseLogIndexes() {
  const ExerciseLog = require('../models/ExerciseLog');
  try {
    const unset = await ExerciseLog.updateMany(
      { $or: [{ fitbitLogId: null }, { fitbitLogId: '' }] },
      { $unset: { fitbitLogId: 1 } }
    );
    if (unset.modifiedCount) {
      console.log(`ExerciseLog: cleared fitbitLogId on ${unset.modifiedCount} manual log(s)`);
    }

    const coll = ExerciseLog.collection;
    const indexes = await coll.indexes();
    for (const idx of indexes) {
      if (
        idx.name === 'userId_1_fitbitLogId_1' ||
        (idx.key?.userId === 1 && idx.key?.fitbitLogId === 1 && idx.sparse && !idx.partialFilterExpression)
      ) {
        await coll.dropIndex(idx.name);
        console.log(`ExerciseLog: dropped old index ${idx.name}`);
      }
    }

    await ExerciseLog.syncIndexes();
    console.log('ExerciseLog: indexes synced');
  } catch (err) {
    console.error('ExerciseLog index repair failed:', err.message);
  }
}

module.exports = repairExerciseLogIndexes;
