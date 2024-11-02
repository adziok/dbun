export function onlyUnique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

// TODO add compare for each data type to easily optimize the code

export function compareInt(left: any, operator: string, right: any): boolean {
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
      return left !== right;
    // case '===':
    //   return left === right;
    // case '!==':
    //   return left !== right;
  }
  throw new Error(`Unsupported operator: ${operator}`);
}

export function compareString(
  left: any,
  operator: string,
  right: any,
): boolean {
  // TODO replace with dictionary instead of switch
  switch (operator) {
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

export function compareBoolean(
  left: any,
  operator: string,
  right: any,
): boolean {
  // TODO replace with dictionary instead of switch
  switch (operator) {
    case '=':
      return Boolean(left) == Boolean(right);
    case '!=':
      return Boolean(left) != Boolean(right);
    // case '===':
    //   return left === right;
    // case '!==':
    //   return left !== right;
  }
  throw new Error(`Unsupported operator: ${operator}`);
}

export function compareTimestamp(
  left: Date,
  operator: string,
  right: Date,
): boolean {
  // TODO replace with dictionary instead of switch
  switch (operator) {
    case '>':
      return left.getTime() > right.getTime();
    case '<':
      return left.getTime() < right.getTime();
    case '>=':
      return left.getTime() >= right.getTime();
    case '<=':
      return left.getTime() <= right.getTime();
    case '=':
      return left.getTime() == right.getTime();
    case '!=':
      return left.getTime() !== right.getTime();
  }
  throw new Error(`Unsupported operator: ${operator}`);
}

export const getCompareFunction = (dataType: string) => {
  if (dataType === 'string') {
    return compareString;
  }
  if (dataType === 'int') {
    return compareInt;
  }
  if (dataType === 'boolean') {
    return compareBoolean;
  }
  if (dataType === 'timestamp') {
    return compareTimestamp;
  }
  throw new Error(`Unsupported data type: ${dataType}`);
};
