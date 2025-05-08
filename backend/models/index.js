import mongoose from 'mongoose';

const models = {};

export const initializeModels = async () => {
  const Client = (await import('./Client.js')).default;
  const ApiKey = (await import('./ApiKey.js')).default;
  const FaydaUserData = (await import('./FaydaUserData.js')).default;
  
  models.Client = Client;
  models.ApiKey = ApiKey;
  models.FaydaUserData = FaydaUserData;
  
  return models;
};

export const getModels = () => models;
