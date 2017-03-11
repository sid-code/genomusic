(() => {
  const rng = new PSprng(Math.random());
  const mev = new MelodyEvolver(rng, 4, 5);

  const createMelodyButton = (melody, actx) => {
    const el = document.createElement("button");
    el.addEventListener("click", () => {
      console.log(melody);
      melody.play(actx, actx.destination, 160);
      melody.map(n => n+5).play(actx, actx.destination, 160);
    });

    el.innerText = melody.getScore();
    const gen = melody.generation;
    const cval = Math.floor(255 - gen * 255/30);
    el.style.backgroundColor = "rgb(" + cval + "," + cval + "," + cval + ")";

    return el;
  };

  var curGenIndex = 0;
  const nextGeneration = (curGen, actx) => {
    curGenIndex++;
    const genLabel = document.createElement("p");
    genLabel.innerText = "Generation " + curGenIndex + ": ";

    const nextGen = mev.stepGen();

    for (melody of nextGen) {
      const melodyEl = createMelodyButton(melody, actx);
      genLabel.appendChild(melodyEl);


    }

    document.body.appendChild(genLabel);

    return nextGen;

  }

  const ready = () => {
    const actx = new AudioContext();

    const seed = mev.initSeed(8);
    const seedEl = createMelodyButton(seed, actx);
    const seedLabel = document.createElement("p");
    seedLabel.innerText = "Seed: ";
    document.body.appendChild(seedLabel);
    seedLabel.appendChild(seedEl);

    var curGen = [seed];

    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
    curGen = nextGeneration(curGen, actx);
  };
  document.addEventListener("DOMContentLoaded", ready);
})();
