// Global test setup file for Jest

// Mock the Decimal type from Prisma
jest.mock('@prisma/client/runtime/library', () => ({
  Decimal: class {
    private value: number;
    constructor(value: number) {
      this.value = value;
    }
    toNumber() {
      return this.value;
    }
  }
}));

// Extend Jest matchers if needed
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      // Add custom matchers here if needed
    }
  }
}

export {};