import axios from 'axios';
import {
  Transaction,
  AuditLog,
  DashboardMetrics,
  BatchSimulationResult,
  SystemHealth,
  SafetyRule
} from '../types';

const API = axios.create({
  baseURL: '/api'
});

export const fetchHealth = async (): Promise<SystemHealth> => {
  const res = await API.get('/health');
  return res.data;
};

export const fetchDashboardMetrics = async () => {
  const res = await API.get('/dashboard/metrics');
  return res.data;
};

export const fetchTransactions = async (params?: { search?: string; status?: string; limit?: number; page?: number }) => {
  const res = await API.get('/transactions', { params });
  return res.data;
};

export const fetchTransactionById = async (id: string) => {
  const res = await API.get(`/transactions/${id}`);
  return res.data;
};

export const analyzeTransaction = async (id: string) => {
  const res = await API.post(`/recovery/analyze/${id}`);
  return res.data;
};

export const executeRecoveryAction = async (id: string, action?: string) => {
  const res = await API.post(`/recovery/execute/${id}`, { action });
  return res.data;
};

export const runBatchSimulation = async (): Promise<BatchSimulationResult> => {
  const res = await API.post('/recovery/simulate');
  return res.data;
};

export const runFailureDemo = async () => {
  const res = await API.post('/recovery/failure-demo');
  return res.data;
};

export const fetchAnalytics = async () => {
  const res = await API.get('/analytics');
  return res.data;
};

export const fetchAuditLogs = async (params?: { search?: string; eventType?: string; page?: number }) => {
  const res = await API.get('/audit-logs', { params });
  return res.data;
};

export const fetchSafetyRules = async () => {
  const res = await API.get('/safety-rules');
  return res.data;
};

export const regenerateDataset = async () => {
  const res = await API.post('/transactions/generate');
  return res.data;
};
