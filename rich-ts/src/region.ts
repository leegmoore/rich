/**
 * Coordinates describing a rectangular region in the console.
 */
export interface RegionInit {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Represents a rectangular area (top-left origin, width, height).
 */
export class Region implements RegionInit {
  public readonly x: number;
  public readonly y: number;
  public readonly width: number;
  public readonly height: number;

  constructor(x: number, y: number, width: number, height: number) {
    validateDimension('width', width);
    validateDimension('height', height);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /** Convenience factory when starting from a tuple-like object. */
  static from(init: RegionInit): Region {
    return new Region(init.x, init.y, init.width, init.height);
  }

  /** Right-most coordinate (exclusive). */
  get right(): number {
    return this.x + this.width;
  }

  /** Bottom coordinate (exclusive). */
  get bottom(): number {
    return this.y + this.height;
  }

  /** Area in square cells. */
  get area(): number {
    return this.width * this.height;
  }

  /** Check whether the region contains the provided point. */
  containsPoint(x: number, y: number): boolean {
    return x >= this.x && x < this.right && y >= this.y && y < this.bottom;
  }

  /** True if two regions overlap. */
  intersects(other: Region): boolean {
    return !(
      other.right <= this.x ||
      other.x >= this.right ||
      other.bottom <= this.y ||
      other.y >= this.bottom
    );
  }

  /**
   * Returns the overlapping region or undefined if the rectangles are disjoint.
   */
  intersection(other: Region): Region | undefined {
    if (!this.intersects(other)) {
      return undefined;
    }
    const x = Math.max(this.x, other.x);
    const y = Math.max(this.y, other.y);
    const right = Math.min(this.right, other.right);
    const bottom = Math.min(this.bottom, other.bottom);
    return new Region(x, y, right - x, bottom - y);
  }

  /** Create a region shifted by the provided delta. */
  translate(dx: number, dy: number): Region {
    return new Region(this.x + dx, this.y + dy, this.width, this.height);
  }

  /** Update select fields while keeping immutability semantics. */
  with(update: Partial<RegionInit>): Region {
    return new Region(
      update.x ?? this.x,
      update.y ?? this.y,
      update.width ?? this.width,
      update.height ?? this.height
    );
  }

  /** Serialize to plain object for JSON usage. */
  toJSON(): RegionInit {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  /** Debug helper consistent with python tuple repr. */
  toString(): string {
    return `Region(x=${this.x}, y=${this.y}, width=${this.width}, height=${this.height})`;
  }
}

function validateDimension(label: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`);
  }
  if (value < 0) {
    throw new RangeError(`${label} must be >= 0`);
  }
}
