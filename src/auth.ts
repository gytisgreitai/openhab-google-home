export function getAuthToken(headers: { [header: string]: string | string[] | undefined }) {
  if (!headers ||  !headers.authorization) {
    return 
  }
  return (headers.authorization as string).substr(7)
}