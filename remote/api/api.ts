import axios from 'axios'
import { config } from '../config';
import { Api, OpenhabItem, ApiParameters } from '@openhab-google-home/core';


const baseUrl = `${config.openhab.host}${config.openhab.itemsPath}`;

export class OpnehabApi implements Api {

  constructor(private authToken) {
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


  private invoke<T>(url: string) {

    const headers = {}
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return axios({
      method: 'GET',
      url ,
      headers,
      params: ApiParameters
    }).then(res => res.data as T)
  }

}