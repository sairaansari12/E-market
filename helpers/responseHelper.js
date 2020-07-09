
const get = (res, message, resData,code= 200) => {
  return res.status(code).json({
    code: code,
    message: message,
    body: resData
  });
}

const post = (res, message, resData,code = 200) => {
  return res.status(200).json({
    code: code,
    message: message,
    body: resData
  });
}

const del = (res, message,resData,code= 200) => {
  return res.status(code).json({
    code: code,
    message: message,
    body: resData
  });
}

const put = (res, message, resData,code = 200) => {
  return res.status(code).json({
    code: code,
    message: message,
    body: resData
  });
}

const unauthorized = (res, message,code = 401) => {
  return res.status(code).json({
    code: code,
    message: message,
    body: {}
  });
}

const error = (res, message,code = 400) => {
  return res.status(code).json({
    code: code,
    message: message,
    body: {}
  });
}

const noData = (res, message,code = 204) => {
  return res.json({
    code: code,
    message: message,
    body: {}
  });
}

module.exports = {
  get,
  post,
  put,
  del,
  error,
  noData,
  unauthorized
}