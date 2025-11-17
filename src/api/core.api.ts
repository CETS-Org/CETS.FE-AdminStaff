import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

export const getLookupsByTypeCode = (typeCode: string, config?: AxiosRequestConfig) =>
  api.get(`/api/CORE_LookUp/type/code/${typeCode}`, config);


