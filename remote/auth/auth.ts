
import { getStandaloneToken } from "./standalone";
import { config } from "../config";

export function getAuthTokenOrFail(headers: { [header: string]: string | string[] | undefined }) {
  if (!headers || !headers.authorization) {
    throw new Error('Authorization failed'); 
  }
  const token = (headers.authorization as string).substr(7);

  // if not standalone, it will fail later, on post or update
  if(config.standalone.enabled && token !== getStandaloneToken()) {
    throw new Error('Standalone token missmatched');
  }
  return token;
}