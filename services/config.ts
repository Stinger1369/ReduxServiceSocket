// Utiliser une variable d'environnement pour l'URL, avec un fallback
const CHAT_SERVICE_IP = process.env.REACT_APP_CHAT_SERVICE_IP || "192.168.10.108";
export const CHAT_SERVICE_URL = `http://${CHAT_SERVICE_IP}:3000`;
export const CHAT_SERVICE_URL_LOCALHOST = "http://localhost:3000";

export const SOCKET_RECONNECTION_ATTEMPTS = 20;
export const SOCKET_RECONNECTION_DELAY = 500;
export const SOCKET_RECONNECTION_DELAY_MAX = 2000;
export const SOCKET_TIMEOUT = 30000; // Augmenté à 30 secondes