import { Howl } from "howler";
import { soundLibrary } from "./sound-library";
import { writable } from "svelte/store";

export const music = writable(new Howl({ src: [""] }));
export const fx = writable([new Howl({ src: [""] })]);

/**
 * Initializes and preloads all sounds from the `tcm` property of the `soundLibrary` object.
 * This ensures that there's minimal delay when the sounds are played for the first time.
 *
 * @example
 * initSound();  // Preloads all the sounds in soundLibrary.tcm
 *
 * @returns {void}
 */
export function initSound() {
  for (const key in soundLibrary.tcm) {
    soundLibrary.tcm[key].sound = new Howl({
      src: [soundLibrary.tcm[key].src],
      volume: soundLibrary.tcm[key].volume,
      preload: true
    })
  }
  for (const key in soundLibrary.tcm2) {
    soundLibrary.tcm2[key].sound = new Howl({
      src: [soundLibrary.tcm2[key].src],
      volume: soundLibrary.tcm2[key].volume,
      preload: true
    })
  }
}

/**
 * Plays a sound based on category and id. Provides options for looping and fade effects.
 *
 * @export
 * @param {string} category - The category of the sound.
 * @param {string} id - The id of the sound within the category.
 * @param {boolean} [loop=false] - Determines if the sound should loop.
 * @param {boolean} [fade=false] - Determines if the sound should have fade in/out effects.
 */
export function playSound(category: string, id: string, loop = false, fade = false) {

  const sound = soundLibrary[category][id].sound

  if (!sound) return

  if (loop) {
    sound.loop(true)
  }

  if (fade) {
    // Fade on begin and end
    const FADE_TIME = 2000;

    // Init
    sound.play();
    sound.fade(0, 0.4, FADE_TIME);
    sound.on("load", function () {
      const FADE_OUT_TIME = sound.duration() * 1000 - sound.seek() - FADE_TIME;
      setTimeout(function () {
        sound.fade(0.4, 0, FADE_TIME);
      }, FADE_OUT_TIME);
    });
  } else {
    sound.play();
  }
}