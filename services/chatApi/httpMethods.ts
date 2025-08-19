import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ErrorResponse } from './types';

// Utiliser l'URL du service de chat depuis les variables d'environnement
export const CHAT_SERVICE_URL = process.env.REACT_APP_CHAT_API_URL || 'http://192.168.10.108:3000';

export const get = async <T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('chatApiClient GET: Token retrieved:', token);
    console.log('chatApiClient GET: Endpoint:', `${CHAT_SERVICE_URL}${endpoint}`);

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${CHAT_SERVICE_URL}${endpoint}`, {
      headers,
      params: config.params,
    });

    console.log('chatApiClient GET: Response:', response.data);
    if (response.data === undefined || response.data === null) {
      throw new Error('Aucune donnée reçue dans la réponse');
    }

    return response.data as T;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('chatApiClient GET failed:', axiosError.response?.data || axiosError.message);
    const errorResponse: ErrorResponse = {
      error: axiosError.response?.data?.error || 'Échec de la requête GET',
      action: 'Veuillez réessayer.',
      status: axiosError.response?.status,
    };
    if (axiosError.response?.status === 401) {
      errorResponse.error = 'Non autorisé : token invalide ou expiré';
      errorResponse.action = 'Veuillez vous reconnecter.';
    } else if (axiosError.response?.status === 403) {
      errorResponse.error = 'Accès interdit';
      errorResponse.action = 'Vous n’avez pas les permissions nécessaires.';
    }
    throw errorResponse;
  }
};

export const post = async <T>(endpoint: string, data: unknown, config: AxiosRequestConfig = {}): Promise<T> => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('chatApiClient POST: Token retrieved:', token);
    console.log('chatApiClient POST: Endpoint:', `${CHAT_SERVICE_URL}${endpoint}`);

    const headers: { [key: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (data instanceof FormData) {
      console.log('chatApiClient POST: Sending FormData');
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axios.post(`${CHAT_SERVICE_URL}${endpoint}`, data, {
      headers,
      ...config,
    });

    console.log('chatApiClient POST: Response:', response.data);
    if (response.data === undefined || response.data === null) {
      throw new Error('Aucune donnée reçue dans la réponse');
    }

    return response.data as T;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('chatApiClient POST failed:', axiosError.response?.data || axiosError.message);
    const errorResponse: ErrorResponse = {
      error: axiosError.response?.data?.error || 'Échec de la requête POST',
      action: 'Veuillez réessayer.',
      status: axiosError.response?.status,
    };
    if (axiosError.response?.status === 401) {
      errorResponse.error = 'Non autorisé : token invalide ou expiré';
      errorResponse.action = 'Veuillez vous reconnecter.';
    }
    throw errorResponse;
  }
};

// Les fonctions `put` et `del` restent inchangées, mais assurez-vous qu'elles utilisent `CHAT_SERVICE_URL` correctement
export const put = async <T>(endpoint: string, data: unknown, config: AxiosRequestConfig = {}): Promise<T> => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('chatApiClient PUT: Token retrieved:', token);
    console.log('chatApiClient PUT: Endpoint:', `${CHAT_SERVICE_URL}${endpoint}`);

    const headers: { [key: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (data instanceof FormData) {
      console.log('chatApiClient PUT: Sending FormData');
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axios.put(`${CHAT_SERVICE_URL}${endpoint}`, data, {
      headers,
      ...config,
    });

    console.log('chatApiClient PUT: Response:', response.data);
    if (response.data === undefined || response.data === null) {
      throw new Error('Aucune donnée reçue dans la réponse');
    }

    return response.data as T;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('chatApiClient PUT failed:', axiosError.response?.data || axiosError.message);
    const errorResponse: ErrorResponse = {
      error: axiosError.response?.data?.error || 'Échec de la requête PUT',
      action: 'Veuillez réessayer.',
      status: axiosError.response?.status,
    };
    if (axiosError.response?.status === 401) {
      errorResponse.error = 'Non autorisé : token invalide ou expiré';
      errorResponse.action = 'Veuillez vous reconnecter.';
    }
    throw errorResponse;
  }
};

export const del = async <T>(endpoint: string, config: { data?: unknown } & AxiosRequestConfig = {}): Promise<T> => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('chatApiClient DEL: Token retrieved:', token);
    console.log('chatApiClient DEL: Endpoint:', `${CHAT_SERVICE_URL}${endpoint}`);

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.delete(`${CHAT_SERVICE_URL}${endpoint}`, {
      headers,
      data: config.data,
      ...config,
    });

    console.log('chatApiClient DEL: Response:', response.data);
    return response.data as T;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('chatApiClient DEL failed:', axiosError.response?.data || axiosError.message);
    const errorResponse: ErrorResponse = {
      error: axiosError.response?.data?.error || 'Échec de la requête DEL',
      action: 'Veuillez réessayer.',
      status: axiosError.response?.status,
    };
    if (axiosError.response?.status === 401) {
      errorResponse.error = 'Non autorisé : token invalide ou expiré';
      errorResponse.action = 'Veuillez vous reconnecter.';
    }
    throw errorResponse;
  }
};