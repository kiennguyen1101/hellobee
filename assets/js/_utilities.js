export function getXsrf(store) {
  const xsrf = store.get('_xsrf');
  if (xsrf !== null) {
    return atob(xsrf.split('|')[0]);
  }
  return "";
}

export function isRequestSuccess(request) {
  const success_code_list = [200, 201];
  const response = request.json();  
  if (success_code_list.indexOf(response.status) !== -1) {
    return Promise.resolve(response.data);
  } else {
    return Promise.reject(response.data);
  }
}