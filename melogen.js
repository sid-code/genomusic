/*
 * This code mutates melodies and calculates their score, keeping good ones.
 */

(() => {

  class MelodyEvolver {
    constructor(rng, initialJitter = 4, mutationSize = 3) {
      this.rng = rng;
      this.generations = [];
      
      this.initialJitter = initialJitter;
      this.mutationSize = mutationSize;
    }

    initSeed(size) {
      this.generations.length = 0;

      const notes = []

      var i;
      var curNote = 0;
      notes.push(curNote);
      for (i = 0; i < size - 1; i++) {
        const jitter1 = this.rng.nextInt(-this.initialJitter, this.initialJitter + 1);
        const jitter2 = this.rng.nextInt(-this.initialJitter, this.initialJitter + 1);
        // Two jitters are calculated to bias against zero

        const delta = jitter1 || jitter2;
        curNote += delta;

        notes.push(curNote);
      }

      const melody = new Melody(...notes);
      melody.generation = 0;

      this.generations.push([melody]);

      return melody;

    }


    // Mutates each melody in `curGen` `branchSize` times, aggregates all new melodies, and keeps the
    // best `maxSize` ones.
    stepGen(fitness = 'getScore', branchSize = 20, maxSize = 30) {
      if (this.generations.length === 0) {
        throw "initSeed() must be called before stepGen()";
      }

      const newMelodies = [];
      const curGen = this.generations[this.generations.length - 1];

      for (const melody of curGen) {
        let i;
        for (i = 0; i < branchSize; i++) {
          let mutation = melody.mutate(this.rng, this.mutationSize);
          if (mutation.getScore() > 0) {
            mutation.generation = this.generations.length;
            newMelodies.push(mutation);
          }
        }
      }

      const nextGen = curGen.concat(newMelodies).sort( (m1, m2) => m2[fitness]() - m1[fitness]() ).slice(0, maxSize);
      this.generations.push(nextGen);
      return nextGen;
    }

  }

  window.MelodyEvolver = MelodyEvolver;


})();
