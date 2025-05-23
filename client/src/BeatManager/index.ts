export default class BeatManager {
  interval: number | null;
  beatMs: number;

  beatCallback = () => {};

  constructor() {
    this.interval = null;
    this.beatMs = 2000;
  }

  startAt(at: Date) {
    setTimeout(() => {
      // TODO: start music playback here!
      this.interval = setInterval(() => {
        this.beatCallback && this.beatCallback();
      }, this.beatMs);
    }, at.getMilliseconds() - new Date().getMilliseconds());
  }

  stop() {
    // TODO: stop music playback here!
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  onBeat(cb: () => void) {
    this.beatCallback = cb;
  }
}
