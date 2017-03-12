(() => {
  class Chord extends Array {

    // returns a number
    // higher number = better match for the bar
    match(bar) {
      var result = 0;
      for (const note of this) {
	if (bar.indexOf(note) != -1) {
	  result++;
	}
      }

      return result;
    }

    toString() {
      return this.type;
    }

    transpose(shift) {
      const chord = new this.constructor(...this.map(n => n + shift)); // <-- wat
      chord.type = this.type;
      chord.anchor = this.anchor + shift;
      return chord;
    }

    static create(type, anchor, notes) {
      const chord = new this(...notes);
      chord.type = type;
      chord.anchor = anchor;
      return chord;
    }

    static bestMatch(bar) {
      var curBest = 0;
      var curBestChord = null;
      for (const chord of chcll.chords) {
	const match = chord.match(bar);
	if (curBestChord == null || match > curBest) {
	  curBest = match;
	  curBestChord = chord;
	}
      }

      return curBestChord;
    }

    static isGoodTransition(c1, c2) {
      return chordTransitions[c1.type].indexOf(c2.type) > -1;
    }
  }

  const ChordType = {
    I: Symbol("I"),
    IV: Symbol("IV"),
    V7: Symbol("V7"),
    V: Symbol("V"),
  };

  class ChordCollection {
    constructor() {
      this.chords = [];
    }

    add(c) {
      var i;
      for (i = 0; i < 1; i++) {
	this.chords.push(c.transpose(i));
      }
    }
  }

  const chcll = new ChordCollection();
  chcll.add(Chord.create(ChordType.I, 0, [0, 4, 7]));
  chcll.add(Chord.create(ChordType.IV, 0, [0, 5, 9]));
  chcll.add(Chord.create(ChordType.V7, 0, [5, 7, 11]));
  chcll.add(Chord.create(ChordType.V, 0, [2, 7, 11]));
  
  const chordTransitions = {
    [ChordType.IV]: [ChordType.I, ChordType.V, ChordType.V7],
    [ChordType.V]: [ChordType.I],
    [ChordType.V7]: [ChordType.I, ChordType.V],
    [ChordType.I]: [ChordType.I, ChordType.IV],
  };
  
  window.Chord = Chord;

})();
