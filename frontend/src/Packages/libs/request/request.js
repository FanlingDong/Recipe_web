import qs from "query-string";

// const baseUrl = "http://3.26.64.9:5000";
const baseUrl = "http://127.0.0.1:5000";

// initial request
const request = Object.create(null);
// browser support method => ['DELETE', 'GET', 'HEAD', 'OPTION', 'POST', 'PATCH', 'PUT']
const HTTP_METHOD = ["get", "post", "put", "patch", "delete"];
// can send data method
const CAN_SEND_METHOD = ["post", "put", "delete", "patch"];
HTTP_METHOD.forEach((method) => {
  const canSend = CAN_SEND_METHOD.includes(method);
  request[method] = (path, { data, query, params } = {}) => {
    let url = path;
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application.json",
        Authorization: localStorage.getItem("viteToken")
          ? `Bearer ${localStorage.getItem("viteToken")}`
          : undefined,
      },
      body: JSON.stringify(data),
      // credentials: 'include!
      mode: "cors",
      // cache: 'no-cache'
    };
    if (query) {
      url = `${path}${url.includes("?") ? "&" : "?"}${qs.stringify(query)}`;
    }
    if (params) {
      Object.keys(params).forEach((key) => {
        url = url.replace(`:${key}`, params[key]);
      });
    }
    if (canSend && data) {
      opts.body = JSON.stringify(data);
    }
    return fetch(`${baseUrl}${url}`, opts)
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  };
});

export default request;
