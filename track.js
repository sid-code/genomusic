(() => {
  class Track {
    constructor(voices) {
      this.voices = voices;
      this.checkVoices();
    }


    static checkVoices() { throw "abstract function cannot be called"; }
    static mutate() { throw "abstract function cannot be called"; }
    static genRandom() { throw "abstract function cannot be called"; }
    static score() { throw "abstract function cannot be called"; }
  }

  class MatrixTrack extends Track {
    mutate(rng) {
      const newVoices = [];
      for (const voice of this.voices) {
        newVoices.push(voice.mutate(rng));
      }

      // `this.constructor` resolves to MatrixTrack, hence the strange syntax
      return new this.constructor(newVoices);
    }

    checkVoices() {
      var oldLen = null;
      for (const voice of this.voices) {
        const len = voice.length;
        if (len == 0) {
          throw "cannot have a zero-length voice";
        }

        if (oldLen != null && len != oldLen) {
          throw "all voices must be of the same length";
        }

        oldLen = len;
      }

    }

    score() {
      var plainScore = 0;
      for (const voice of this.voices) {
        plainScore += voice.score();
      }

      var chordScore = 0;

      if (this.voices.length > 1) {
        let i;
        for (i = 0; i < this.voices[0].length; i++) {
          const crossSection = this.voices.map(v => v[i]);
          chordScore += new Melody(...crossSection).score();
        }
      }

      return plainScore + chordScore * 2;
    }

    addBackingVoice(rng) {
      const backingNotes = [];
      const mainVoice = this.voices[0];
      for (const chord of mainVoice.chordProg) {
        const type = rng.nextInt(0, 3);
        switch(type) {
          case 0:
            backingNotes.push(chord[0]);
            backingNotes.push(chord[2]);
            backingNotes.push(chord[1]);
            backingNotes.push(chord[2]);
            break;
          case 1:
            backingNotes.push(chord[1]);
            backingNotes.push(chord[2]);
            backingNotes.push(chord[0]);
            backingNotes.push(chord[2]);
            break;
          case 2:
            backingNotes.push(chord[1]);
            backingNotes.push(chord[2]);
            backingNotes.push(chord[0]);
            backingNotes.push(chord[2]);
            break;
        }
      }

      const backingMelody = new Melody(...backingNotes);
      console.log(backingMelody);
      this.voices.push(backingMelody);
    }

    removeBackingVoice() {
      this.voices.pop();
    }

    play(tempo = 120) {
      for (const voice of this.voices) {
        voice.play(tempo);
      }
    }

    playOld(actx, output, tempo = 120) {
      for (const voice of this.voices) {
        voice.playOld(actx, output, tempo);
      }
    }

    // Note: be careful, cols is the length of the track and rows is the number
    // of concurrent voices.

    static genRandom(rng, {rows, cols, jitter}) {

      const voices = [];
      var i;
      for (i = 0; i < rows; i++) {
        voices.push(Melody.genRandom(rng, cols, jitter));
      }

      // In a static function, `this` resolves to `Track`, hence the strange
      // `new this(...)` syntax

      return new this(voices);
    }
  }

  // Expose these classes
  window.Track = Track;
  window.MatrixTrack = MatrixTrack;

})();
