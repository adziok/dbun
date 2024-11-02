import { DataType } from './data-type';
import { IntDataType } from './int.ts';

export class FloatDataType extends DataType<number> {
  name = 'float';

  canBeComparedWith<AnotherType>(anotherType: AnotherType): boolean {
    const supportedCompareTypes = [IntDataType, FloatDataType];
    return (
      supportedCompareTypes.find((type) => anotherType instanceof type) !==
      undefined
    );
  }

  canBeFilteredWith<AnotherType>(anotherType: AnotherType): boolean {
    return anotherType instanceof IntDataType;
  }

  fromString(value: string): number {
    return parseFloat(value);
  }

  static fromString(value: string): number {
    return parseFloat(value);
  }
}
