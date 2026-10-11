export interface TimerManagerOptions {
  countdownSeconds?: number;
  totalShots?: number;
  intervalBetweenShotsMs?: number;
  onTick?: (remainingSeconds: number, currentShot: number, totalShots: number) => void;
  onCapture?: (currentShot: number, totalShots: number) => void;
  onComplete?: () => void;
}

export class TimerManager {
  private countdownSeconds: number;
  private totalShots: number;
  private intervalBetweenShotsMs: number;
  private onTick?: (remainingSeconds: number, currentShot: number, totalShots: number) => void;
  private onCapture?: (currentShot: number, totalShots: number) => void;
  private onComplete?: () => void;

  private active: boolean = false;
  private currentShot: number = 0;
  private remainingSeconds: number;
  private intervalTimerId: ReturnType<typeof setInterval> | null = null;
  private timeoutTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor(options: TimerManagerOptions = {}) {
    this.countdownSeconds = options.countdownSeconds ?? 3;
    this.totalShots = options.totalShots ?? 1;
    this.intervalBetweenShotsMs = options.intervalBetweenShotsMs ?? 1000;
    this.onTick = options.onTick;
    this.onCapture = options.onCapture;
    this.onComplete = options.onComplete;
    this.remainingSeconds = this.countdownSeconds;
  }

  public isActive(): boolean {
    return this.active;
  }

  public getCurrentShot(): number {
    return this.currentShot;
  }

  public getTotalShots(): number {
    return this.totalShots;
  }

  public getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  public start(): void {
    if (this.active) {
      this.cancel();
    }
    this.active = true;
    this.currentShot = 1;
    this.startCountdownForCurrentShot();
  }

  private startCountdownForCurrentShot(): void {
    this.remainingSeconds = this.countdownSeconds;
    this.onTick?.(this.remainingSeconds, this.currentShot, this.totalShots);

    this.intervalTimerId = setInterval(() => {
      this.remainingSeconds -= 1;
      if (this.remainingSeconds > 0) {
        this.onTick?.(this.remainingSeconds, this.currentShot, this.totalShots);
      } else {
        this.clearTimers();
        this.onCapture?.(this.currentShot, this.totalShots);

        if (this.currentShot < this.totalShots) {
          this.timeoutTimerId = setTimeout(() => {
            if (!this.active) return;
            this.currentShot += 1;
            this.startCountdownForCurrentShot();
          }, this.intervalBetweenShotsMs);
        } else {
          this.active = false;
          this.onComplete?.();
        }
      }
    }, 1000);
  }

  private clearTimers(): void {
    if (this.intervalTimerId !== null) {
      clearInterval(this.intervalTimerId);
      this.intervalTimerId = null;
    }
    if (this.timeoutTimerId !== null) {
      clearTimeout(this.timeoutTimerId);
      this.timeoutTimerId = null;
    }
  }

  public cancel(): void {
    this.clearTimers();
    this.active = false;
    this.currentShot = 0;
    this.remainingSeconds = this.countdownSeconds;
  }
}
