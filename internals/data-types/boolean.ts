import { DataType } from './data-type';

export class BooleanDataType extends DataType<boolean> {
  name = 'boolean';

  canBeComparedWith<AnotherType>(anotherType: AnotherType): boolean {
    const supportedCompareTypes = [BooleanDataType];
    return (
      supportedCompareTypes.find((type) => anotherType instanceof type) !==
      undefined
    );
  }

  canBeFilteredWith<AnotherType>(anotherType: AnotherType): boolean {
    return anotherType instanceof BooleanDataType;
  }

  fromString(value: string): boolean {
    return value === '1';
  }

  static override fromString(value: string): boolean {
    return value === '1';
  }
}
