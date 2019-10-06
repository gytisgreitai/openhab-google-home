import axios from 'axios'
import { config } from './../config';
import { OpenhabItem } from '../model/openhab';


const parameters = {
  fields: 'editable,groupNames,groupType,name,label,metadata,stateDescription,tags,type',
  metadata: 'google,channel,synonyms,autoupdate'
};

const baseUrl = `${config.openhab.host}${config.openhab.itemsPath}`;

function get<T>(authToken, url) {

  const headers = {}
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return axios({
    method: 'GET',
    url ,
    headers,
    params: parameters
  }).then(res => res.data as T)
}

function getAll(authToken: string) {
  return get<OpenhabItem[]>(authToken, baseUrl);
}

function getItem(authToken: string, item: string) {
  return get<OpenhabItem>(authToken, baseUrl + item);
}

function updateState(authToken: string, item: string, value: string) {
  const headers = {
    'Content-Type': 'text/plain'
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return axios({
    method: 'POST',
    url: baseUrl + item,
    headers: headers,
    data: value
  })
}

export const api = {
  getAll,
  getItem,
  updateState
}