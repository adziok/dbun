import {
  DataType,
  supportedDataTypes,
  supportedDataTypesNames,
} from './data-type';
import { IntDataType } from './int';
import { StringDataType } from './string';

interface Constructor<T> {
  new (): T;
}

export const typeNameToDataTypeDirectory: Record<
  supportedDataTypesNames,
  Constructor<DataType<unknown>>
> = {
  string: StringDataType,
  int: IntDataType,
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
