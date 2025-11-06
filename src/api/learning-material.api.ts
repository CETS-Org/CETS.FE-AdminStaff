import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

const learningMaterialEndpoint = '/api/ACAD_LearningMaterial';

export type CreateLearningMaterialPayload = {
  classMeetingID: string; // Guid
  title: string; // <= 255
  contentType: string;
  fileName: string;
};

export const createLearningMaterial = (data: CreateLearningMaterialPayload, config?: AxiosRequestConfig) =>
  api.post(`${learningMaterialEndpoint}`, data, config);


