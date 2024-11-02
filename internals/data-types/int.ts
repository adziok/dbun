import { DataType } from './data-type';

export class IntDataType extends DataType<number> {
  name = 'int';

  canBeComparedWith<AnotherType>(anotherType: AnotherType): boolean {
    const supportedCompareTypes = [IntDataType];
    return (
      supportedCompareTypes.find((type) => anotherType instanceof type) !==
      undefined
    );
  }

  canBeFilteredWith<AnotherType>(anotherType: AnotherType): boolean {
    return anotherType instanceof IntDataType;
  }

  fromString(value: string): number {
    return parseInt(value, 10);
  }

  static fromString(value: string): number {
    return parseInt(value, 10);
  }
}
