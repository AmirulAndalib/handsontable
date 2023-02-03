import React from 'react';
import { getRangeValue } from './utils';
import { MESSAGE } from '../constants';

const minAllowedValue = 0;
const maxAllowedValue = 5;

type HandsontableProps = {
  cellProperties: { valid: boolean };
  value: number;
}

export const StarsRenderer = (props: HandsontableProps) => {
  if (props.cellProperties.valid !== false) {
    return (
        <div className="star htCenter">
          {'★'.repeat(getRangeValue(props.value, minAllowedValue, maxAllowedValue))}
        </div>
      );
  }
  
  return (
    <div className="error"> { MESSAGE?.BAD_VALUE } </div>
  );
};
