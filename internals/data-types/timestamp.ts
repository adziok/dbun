import { DataType } from './data-type';

export class TimestampDataType extends DataType<Date> {
  name = 'timestamp';

  canBeComparedWith<AnotherType>(anotherType: AnotherType): boolean {
    const supportedCompareTypes = [TimestampDataType];
    return (
      supportedCompareTypes.find((type) => anotherType instanceof type) !==
      undefined
    );
  }

  canBeFilteredWith<AnotherType>(anotherType: AnotherType): boolean {
    return anotherType instanceof TimestampDataType;
  }

  fromString(value: string): Date {
    return new Date(value);
  }

  static override fromString(value: string): Date {
    return new Date(value);
  }
}
