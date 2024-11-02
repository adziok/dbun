import { DataType } from './data-type';

export class StringDataType extends DataType<string> {
  name = 'string';

  canBeComparedWith<AnotherType>(anotherType: AnotherType): boolean {
    const supportedCompareTypes = [StringDataType];
    return (
      supportedCompareTypes.find((type) => anotherType instanceof type) !==
      undefined
    );
  }

  canBeFilteredWith<AnotherType>(anotherType: AnotherType): boolean {
    return anotherType instanceof StringDataType;
  }

  fromString(value: string): string {
    return value;
  }

  static override fromString(value: string) {
    return value;
  }
}
