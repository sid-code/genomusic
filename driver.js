(() => {
  const actx = new AudioContext();
  const rng = new PSprng(Math.random());
  const trackEvolver = new TrackEvolver(rng, MatrixTrack, 40);
  var midiLoaded = false;

  const createTrackButton = (track, actx) => {
    const el = document.createElement("button");
    el.addEventListener("click", () => {
      console.log(track);
      if (midiLoaded) {
	track.playOld(actx, actx.destination, 160);
      }
    });

    el.innerText = track.score();
    const gen = track.generation;
    const cval = Math.floor(255 - gen * 255/30);
    //el.style.backgroundColor = "rgb(" + cval + "," + cval + "," + cval + ")";

    return el;
  };

  var curGenIndex = 0;
  const nextGeneration = (curGen, actx) => {
    curGenIndex++;
    const genLabel = document.createElement("p");
    genLabel.innerText = "Generation " + curGenIndex + ": ";

    const nextGen = trackEvolver.stepGen();

    for (track of nextGen) {
      const trackEl = createTrackButton(track, actx);
      genLabel.appendChild(trackEl);
    }

    document.body.appendChild(genLabel);

    return nextGen;

  }

  const ready = () => {

    MIDI.loadPlugin({
      soundfontUrl: "./midi-js-soundfonts/FluidR3_GM/",
      instrument: "acoustic_grand_piano",
      onprogress: function(state, progress) {
	console.log(state, progress);
      },
      onsuccess: function() {
	midiLoaded = true;
      }
    });
    const actx = new AudioContext();

    const seed = trackEvolver.initSeed(rng, {rows: 1, cols: 24, jitter: 4});
    const seedEl = createTrackButton(seed, actx);
    const seedLabel = document.createElement("p");
    seedLabel.innerText = "Seed: ";
    document.body.appendChild(seedLabel);
    seedLabel.appendChild(seedEl);

    var curGen = [seed];
    document.addEventListener("keypress", e => {
      curGen = nextGeneration(curGen, actx);
    });
  };
  document.addEventListener("DOMContentLoaded", ready);
})();
