import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';
import type { CreateTimeslotDto, UpdateTimeslotDto, TimeslotFilter } from '@/types/timetable.type';

// Timeslot APIs
export const getTimeslots = (filter?: TimeslotFilter, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/timeslots`, { ...config, params: filter });

export const getTimeslotById = (id: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/timeslots/${id}`, config);

export const createTimeslot = (data: CreateTimeslotDto, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.course}/timeslots`, data, config);

export const updateTimeslot = (id: string, data: UpdateTimeslotDto, config?: AxiosRequestConfig) =>
  api.put(`${endpoint.course}/timeslots/${id}`, data, config);

export const deleteTimeslot = (id: string, config?: AxiosRequestConfig) =>
  api.delete(`${endpoint.course}/timeslots/${id}`, config);

// Timetable Entries APIs
export const getTimetableEntries = (filter?: any, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/timetable`, { ...config, params: filter });

export const getTimetableEntryById = (id: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/timetable/${id}`, config);

export const createTimetableEntry = (data: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.course}/timetable`, data, config);

export const updateTimetableEntry = (id: string, data: any, config?: AxiosRequestConfig) =>
  api.put(`${endpoint.course}/timetable/${id}`, data, config);

export const deleteTimetableEntry = (id: string, config?: AxiosRequestConfig) =>
  api.delete(`${endpoint.course}/timetable/${id}`, config);

