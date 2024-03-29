declare global {
  type ValueOfType<T, K extends keyof T> = T[K];
}

export default {};
