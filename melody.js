/*
 * For our purposes, a melody is just a sequence of notes, so subclassing Array
 * works well.
 */

(() => {

  class Melody extends Array {

    // The heuristic (or fitness function) that represents how good a melody
    // sounds (how viable is it?)

    score() {
      if (this.scoreCache) this.scoreCache;

      // Look at every pair of notes and add the interval score to the total
      // score `intervalScore(note1, note2)` tells us roughly how good two
      // notes sound when played together, and this seems to translate well
      // into melodies. The higher this is, the better.

      var score = this.getHarmonicScore() || 1;

      // We don't want there to be too many different notes. If this is the case,
      // then the melody sounds random and unpleasant.
      //
      // The value of `distinctNotes` will range from 1-12. We don't want too
      // few notes but we don't want too many either. Therefore, the variety
      // factor will be determined based on the distance of `distinctNotes` and
      // its optimal value. This is not known, and what follows is a guess.

      const distinctNotes = this.getDistinctNotes();
      const varietyFactor = Math.max(0, 1 - Math.abs(distinctNotes / Melody.ScoringParameters.optimalDistinctNotes - 1));

      //score *= varietyFactor;

      // The variance of notes is important too; we don't want it to be too high
      // (or too low for that matter). Again, the optimal value for this is not
      // known.

      const vnc = this.getNoteVariance();
      const varianceFactor = Math.max(0, 1 - Math.abs(vnc / Melody.ScoringParameters.optimalVariance - 1));

      score *= varianceFactor;


      //console.log("Variety factor:", varietyFactor, "Variance factor:", varianceFactor);

      // Get the chord progression score
      const cpgFactor = this.getChordScore(4);
      score *= cpgFactor;

      return this.scoreCache = Math.floor(score);
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
      const filtered = this.filter(x => x != null);
      if (filtered.length === 0) {
        return 0;
      }

      return this.variance = variance(filtered);
    }

    getDistinctNotes() {
      if (this.distinctNotes) this.distinctNotes;
      return this.distinctNotes = distinctNotes(this.filter(x => x != null));
    }

    getChordScore(barSize) {
      // first, chunk into `chunkSize`-length bars
      const bars = [];
      var cur = [];
      for (const note of this) {
        if (cur.push(note) >= barSize) {
          bars.push(cur);
          cur = [];
        }
      }

      this.chordProg = [];

      var score = 1;

      var lastChord = null;
      for (const bar of bars) {
        const curChord = Chord.bestMatch(bar);
        this.chordProg.push(curChord);
        if (lastChord != null && !Chord.isGoodTransition(lastChord, curChord)) {
          score = 0;
        }

        lastChord = curChord;
      }

      if (score == 1 && this.chordProg.length > 0) {
        if (this.chordProg.every(chord => chord == this.chordProg[0])) {
          console.log("ALL CHORDS ARE SAME");
          return 0;
        }
      }


      return score;
    }

    // Play this melody using AudioContext `actx`
    play(tempo, callback) {

      var pos = 0;
      const spb = 60/tempo;
      MIDI.setVolume(0, 127);

      const t = setInterval(() => {
        if (pos++ >= this.length) {
          clearInterval(t); 
          if (callback) callback();
          return;
        }

        const note = this[pos];
        if (note == null) {
          console.log("pause");
        } else {
          const midiNote = noteToMIDINote(note);
          MIDI.noteOn(0, midiNote, 127, 0);
          MIDI.noteOff(0, midiNote, 127, spb);
        }

      }, spb * 1000);

    }

    // OLD METHOD (but better?!) Play this melody using AudioContext `actx`
    playOld(actx, output, tempo, callback) {
      console.log(actx);

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
          if (callback) callback;
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
      // we start at 1 to avoid mutating the first note this makes it easier to
      // compare the melodies by ear
      //
      // Don't try to understand the math here, I've forgotten how it works too
      // (but guess what, it works lol)

      for (i = 1; i < len; i++) {
        newNotes[i] = this[i] + rng.nextInt(-mutationSize, mutationSize + 1);
      }
      //for (i = 1; i < len; i++) {
      //  if (this[i] == null) {
      //    newNotes[i] = rng.next() > 1/(len * len) ? null : this[i-1];
      //  } else {
      //    newNotes[i] = this[i] + (rng.next() > 1/(len * len)) ? (rng.next() > 1/len) * rng.nextInt(-mutationSize, mutationSize + 1) : null;
      //  }
      //}

      return new Melody(...newNotes);
    }

    static genRandom(rng, size, jitter = 4) {
      const notes = []

      var i;
      var curNote = 0;
      for (i = 0; i < size; i++) {
        //if (rng.next() < 0.2) {
        //  notes.push(null);
        //  continue
        //}
        const jitter1 = rng.nextInt(-jitter, jitter + 1);
        const jitter2 = rng.nextInt(-jitter, jitter + 1);
        // Two jitters are calculated to bias against zero

        const delta = jitter1 || jitter2;
        curNote += delta;

        notes.push(curNote);
      }

      const melody = new Melody(...notes);

      return melody;
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
    optimalDistinctNotes: 8,
    optimalVariance: 10,
  };

  // Utilities for calculating melody score

  const intervalRanks = [8, 10, 3, 0, 9, 2, 7, 4];
  const badIntervalRanks = [null, null, null, 1, 11];
  // Scores how "good" an interval sounds
  const intervalScore = (a, b) => {
    const interval = Math.abs(b-a) % 12;
    return intervalRanks.indexOf(interval) - badIntervalRanks.indexOf(interval);
  };

  // Count how many distinct notes (ignoring octave) are in a melody
  const distinctNotes = melody => new Set(melody.map(x => x == null ? null : x%12)).size;

  // Simple stats functions
  const mean = ary => {
    return ary.reduce( (x, y) => x + y ) / ary.length;
  };

  const variance = ary => {
    const m = mean(ary);
    return mean(ary.map(x => (x-m) * (x-m)));
  };

  // Utilities for playing melody

  const noteToMIDINote = note => note + 48;
  const noteToFreq = note => 440 * Math.pow(2, (note + 3) / 12);

  // Export these functions for reuse
  Melody.intervalScore = intervalScore;
  Melody.distinctNotes = distinctNotes;
  Melody.variance = variance;


  window.Melody = Melody;
})();
