/*
 * For our purposes, a melody is just a sequence of notes, so subclassing Array
 * works well.
 */

(() => {

  class Melody extends Array {

    // The heuristic (or fitness function) that represents how good a melody
    // sounds (how viable is it?)

    getScore() {
      if (this.score) this.score;

      // Look at every pair of notes and add the interval score to the total
      // score `intervalScore(note1, note2)` tells us roughly how good two
      // notes sound when played together, and this seems to translate well
      // into melodies. The higher this is, the better.

      var score = this.getHarmonicScore();

      // We don't want there to be too many different notes. If this is the case,
      // then the melody sounds random and unpleasant.
      //
      // The value of `distinctNotes` will range from 1-12. We don't want too
      // few notes but we don't want too many either. Therefore, the variety
      // factor will be determined based on the distance of `distinctNotes` and
      // its optimal value. This is not known, and what follows is a guess.

      const distinctNotes = this.getDistinctNotes();
      const varietyFactor = 1 - 0.25 * Math.abs(distinctNotes / Melody.ScoringParameters.optimalDistinctNotes - 1)

      score *= varietyFactor;

      // The variance of notes is important too; we don't want it to be too high
      // (or too low for that matter). Again, the optimal value for this is not
      // known.

      const vnc = this.getNoteVariance();
      const varianceFactor = 1 - 0.5 * Math.abs(vnc / Melody.ScoringParameters.optimalVariance - 1);

      if (varianceFactor === Infinity) alert("INF");
      score *= varianceFactor;

      //console.log("Variety factor:", varietyFactor, "Variance factor:", varianceFactor);

      return this.score = Math.floor(score);
    }

    getHarmonicScore() {
      if (this.harmonicScore) this.harmonicScore;

      const len = this.length;

      var score = 0;

      if (len < 2) {
        return 0;
      }

      var i, j, a, b;
      for (i = 0; i < len - 1; i++) {
        a = this[i];
        if (a == null) continue;

        for (j = i + 1; j < len; j++) {
          b = this[j];
          if (b == null) continue;
          score += intervalScore(a, b);
        }

      }

      return this.harmonicScore = score;

    }

    getNoteVariance() {
      if (this.variance) this.variance;
      return this.variance = variance(this.filter(x => x != null));
    }

    getDistinctNotes() {
      if (this.distinctNotes) this.distinctNotes;
      return this.distinctNotes = distinctNotes(this.filter(x => x != null));
    }

    // Play this melody using AudioContext `actx`
    play(actx, output, tempo = 120) {

      // This will be our note generator
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      gain.connect(output);
      osc.type = "sine";
      osc.connect(gain);

      const spb = 60/tempo * 1000;

      gain.gain.value = 0;

      var pos = -1;

      var started = false;

      const t = setInterval(() => {
        if (!started) {
          osc.start();
          started = true;
        }

        if (++pos >= this.length) {
          osc.stop();
          clearInterval(t); 
          return;
        }

        const note = this[pos];
        if (note == null) {
          console.log("HIT A NULL");
          gain.gain.value = 0;
          console.log(gain.gain);
        } else {
          const freq = noteToFreq(this[pos]);
          gain.gain.value = 1;
          osc.frequency.value = freq;
        }


      }, spb);

    }

    // Mutate a melody (returns a new melody with some notes changed)
    mutate(rng, mutationSize = 3) {
      var newNotes = [this[0]];

      const len = this.length;

      var i;
      // we start at 1 to avoid mutating the first note
      // this makes it easier to compare the melodies by ear
      for (i = 1; i < len; i++) {
        if (this[i] == null) {
          newNotes[i] = rng.next() > 1/(len * len) ? null : this[i-1];
        } else {
          newNotes[i] = this[i] + (rng.next > 1/(len * len)) ? (rng.next() > 1/len) * rng.nextInt(-mutationSize, mutationSize + 1) : null;
        }
      }

      return new Melody(...newNotes);
    }

    // Disable mutator methods:
    copyWithin() { throw "melody is immutable"; }
    fill() { throw "melody is immutable"; }
    pop() { throw "melody is immutable"; }
    push() { throw "melody is immutable"; }
    reverse() { throw "melody is immutable"; }
    shift() { throw "melody is immutable"; }
    sort() { throw "melody is immutable"; }
    splice() { throw "melody is immutable"; }
    unshift() { throw "melody is immutable"; }

  }

  Melody.ScoringParameters = {
    optimalDistinctNotes: 5,
    optimalVariance: 7.5,
  };

  // Utilities for calculating melody score

  const intervalRanks = [8, 10, 3, 0, 9, 4, 7, 2, 5];
  const badIntervalRanks = [null, null, null, 1, 11];
  // Scores how "good" an interval sounds
  const intervalScore = (a, b) => {
    const interval = Math.abs(b-a) % 12;
    return intervalRanks.indexOf(interval) - badIntervalRanks.indexOf(interval);
  };

  // Count how many distinct notes (ignoring octave) are in a melody
  const distinctNotes = melody => new Set(melody.map(x => x%12)).size;

  // Simple stats functions
  const mean = ary => {
    return  ary.reduce( (x, y) => x + y ) / ary.length;
  };

  const variance = ary => {
    const m = mean(ary);
    return mean(ary.map(x => (x-m) * (x-m)));
  };

  // Utilities for playing melody

  const noteToFreq = note => 440 * Math.pow(2, (note + 3) / 12);


  window.Melody = Melody;
})();
