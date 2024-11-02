import {
  DataType,
  supportedDataTypes,
  supportedDataTypesNames,
} from './data-type';
import { IntDataType } from './int';
import { StringDataType } from './string';
import { TimestampDataType } from './timestamp.ts';
import { BooleanDataType } from './boolean.ts';
import { FloatDataType } from './float.ts';

interface Constructor<T> {
  new (): T;
}

export const typeNameToDataTypeDirectory: Record<
  supportedDataTypesNames,
  Constructor<DataType<unknown>>
> = {
  string: StringDataType,
  int: IntDataType,
  boolean: BooleanDataType,
  timestamp: TimestampDataType,
  float: FloatDataType,
};

export const getDateTypeClass = (
  name: string,
): DataType<supportedDataTypes> => {
  const dataTypeClass =
    typeNameToDataTypeDirectory[name as supportedDataTypesNames];
  if (!dataTypeClass) {
    throw new Error(`Data type ${name} is not supported`);
  }
  return new dataTypeClass() as any;
};
