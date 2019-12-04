import axios from 'axios'
import { config } from '../config';
import { Api, OpenhabItem } from '@openhab-google-home/core';


const parameters = {
  fields: 'editable,groupNames,groupType,name,label,metadata,stateDescription,tags,type',
  metadata: 'google,channel,synonyms,autoupdate'
};

const baseUrl = `${config.openhab.host}${config.openhab.itemsPath}`;

export class OpnehabApi implements Api {

  constructor(private authToken) {
  }

  private invoke<T>(url) {

    const headers = {}
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return axios({
      method: 'GET',
      url ,
      headers,
      params: parameters
    }).then(res => res.data as T)
  }

  getAll() {
    return this.invoke<OpenhabItem[]>(baseUrl);
  }

  get(item: string) {
    return this.invoke<OpenhabItem>(baseUrl + item);
  }

  updateState(item: string, value: string) {
    const headers = {
      'Content-Type': 'text/plain'
    }
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return axios({
      method: 'POST',
      url: baseUrl + item,
      headers: headers,
      data: value
    })
  }
}