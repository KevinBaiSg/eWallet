/* @flow */
'use strict';

export type MessageResponse<T> = {
  type: string,
  message: T, // in general, can be anything
};

export type DefaultMessageResponse = MessageResponse<Object>;
