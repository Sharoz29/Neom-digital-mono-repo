export function authHeader() {
  let user = sessionStorage.getItem('pega_react_user');

  if (user) {
    return { 
      'Authorization': user,
    };
  } else {
    return {};
  }
}
