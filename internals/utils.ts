export function onlyUnique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

export function compare(left: any, operator: string, right: any): boolean {
  // TODO replace with dictionary instead of switch
  switch (operator) {
    case '>':
      return left > right;
    case '<':
      return left < right;
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    case '=':
      return left == right;
    case '!=':
      return left != right;
    // case '===':
    //   return left === right;
    // case '!==':
    //   return left !== right;
  }
  throw new Error(`Unsupported operator: ${operator}`);
}
