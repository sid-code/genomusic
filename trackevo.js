/*
 * This code mutates tracks and calculates their score, keeping good ones.
 */

(() => {

  class TrackEvolver {
    // trackType should be a subclass of Track
    // for example, MatrixTrack
    constructor(rng, trackType, mutationSize = 3) {
      this.rng = rng;
      this.trackType = trackType;
      this.generations = [];

      this.mutationSize = mutationSize;
    }

    initSeed(rng, params) {
      const seed = this.trackType.genRandom(this.rng, params);
      seed.generation = 0;

      this.generations[0] = [ seed ];

      return seed;
    }

    // Mutates each track in `curGen` `branchSize` times, aggregates all new track, and keeps the
    // best `maxSize` ones.
    stepGen(branchSize = 20, maxSize = 30) {
      if (this.generations.length === 0) {
        throw "initSeed() must be called before stepGen()";
      }

      const newTracks = [];
      const curGen = this.generations[this.generations.length - 1];

      for (const track of curGen) {
        let i;
        for (i = 0; i < branchSize; i++) {
          let mutation = track.mutate(this.rng, this.mutationSize);
          if (mutation.score() > 0) {
            mutation.generation = this.generations.length;
            newTracks.push(mutation);
          }
        }
      }

      const nextGen = curGen.concat(newTracks).sort( (t1, t2) => t2.score() - t1.score() ).slice(0, maxSize);
      this.generations.push(nextGen);
      return nextGen;
    }

  }

  window.TrackEvolver = TrackEvolver;


})();
