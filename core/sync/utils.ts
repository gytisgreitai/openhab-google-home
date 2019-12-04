import { OpenhabMetaData } from "../model/openhab";

export function getSynonyms(meta: OpenhabMetaData) {
  return (meta.synonyms ? meta.synonyms.value.split(',') : [])
}
