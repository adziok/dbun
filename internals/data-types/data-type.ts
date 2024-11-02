export type supportedDataTypesNames = 'int' | 'string';
export type supportedDataTypes = string | number;

export abstract class DataType<Type> {
  abstract name: string;
  abstract canBeComparedWith<AnotherType>(anotherType: AnotherType): boolean;
  abstract canBeFilteredWith<AnotherType>(anotherType: AnotherType): boolean;
  abstract fromString(value: string): Type;
  static fromString(value: string) {
    throw new Error('Not implemented');
  }
}
