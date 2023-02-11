import type { Sampler } from 'tone';

export function addKeyBoardEvents(sampler: Sampler) {
  let keydown = false;
  document.addEventListener('keypress', (e) => {
    console.log(e);
    //     if (!keydown) {
    //       keydown = true;
    switch (e.key) {
      case 'q':
        return sampler.triggerAttack('c2');
      case '1':
        return sampler.triggerAttack('c#2');
      case 'w':
        return sampler.triggerAttack('d2');
      case '2':
        return sampler.triggerAttack('d#2');
      case 'e':
        return sampler.triggerAttack('e2');
      case 'r':
        return sampler.triggerAttack('f2');
      case '3':
        return sampler.triggerAttack('f#2');
      case 't':
        return sampler.triggerAttack('g2');
      case '4':
        return sampler.triggerAttack('g#2');
      case 'y':
        return sampler.triggerAttack('a2');
      case '5':
        return sampler.triggerAttack('a#2');
      case 'u':
        return sampler.triggerAttack('b2');
      case 'i':
        return sampler.triggerAttack('c3');
      case '6':
        return sampler.triggerAttack('c#3');
      case 'o':
        return sampler.triggerAttack('d3');
      case '7':
        return sampler.triggerAttack('d#3');
      case 'p':
        return sampler.triggerAttack('e3');
      case '[':
        return sampler.triggerAttack('f3');
      case '8':
        return sampler.triggerAttack('f#3');
      case ']':
        return sampler.triggerAttack('g3');
      case '9':
        return sampler.triggerAttack('g#3');
      case '\\':
        return sampler.triggerAttack('a3');
      case '0':
        return sampler.triggerAttack('a#3');
      case '-':
        return sampler.triggerAttack('b3');
      default:
        return;
    }
    //     }
  });

  document.addEventListener('keyup', (e) => {
    keydown = false;
    switch (e.key) {
      case 'q':
      case '1':
      case 'w':
      case '2':
      case 'e':
      case 'r':
      case '3':
      case 't':
      case '4':
      case 'y':
      case '5':
      case 'u':
      case 'i':
      case '6':
      case 'o':
      case '7':
      case 'p':
      case '[':
      case '8':
      case ']':
      case '9':
      case '\\':
      case '0':
      case '-':
        sampler.releaseAll();
    }
  });
}
