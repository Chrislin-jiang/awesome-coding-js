export const proxy = (config) => {
  // mycb.rest.mode === 'xhr'  ->  true
  if (mycb.rest.mode === 'xhr' || config.options && config.options.jsonp)
    return xhr(config);
  const mode = config.crossDomain ? 'cors' : null;
  const method = config.method && config.method.trim().toLocaleUpperCase() || 'GET';
  const headers = config.headers || config.crossDomain ? {} : { 'Content-Type': 'application/json;charset=utf-8' };
  const credentials = config.crossDomain ? null : 'include';
  let url = mycb.rest._getUrl(config.url, config.options);
  const args = [];
  if (method === 'GET' || method === 'DELETE') {
    url = mycb.rest._appendUrl(url, config.params);
    args.push(url);
    args.push({ method, mode, headers, credentials });
  }
  else if (method === 'POST' || method === 'PUT') {
    const body = JSON.stringify(config.params);
    args.push(url);
    args.push({ method, mode, headers, body, credentials });
  }
  mycb.utils.loading(true);
  return fetch.apply(null, args)
    .then(toJSON, catchException)
    .then(function (json) {
      mycb.utils.loading(false);
      if (json.code === 900) {
        mycb.route.redirectLoginPage();
        return;
      }
      return json;
    });
}


// getHotList
getHotList = () => {
  /* const config = {
    url: 'client/PopularKeywords/getList',
    method: 'GET',
    options: { token: true }
  }
  const json = await proxy(config)
  if (json.code != 200) {
    Toast.fail('获取热门搜索数据失败', 2)
  } else {
    Toast.hide()
    this.setState({ hotList: json.data.pkword })
  } */
  const url = "client/PopularKeywords/getList";
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
  };

  fetch(url, options).then((response) => response.json()) // 需要对响应数据进行转换
    .then((data) => {
      Toast.hide()
      this.setState({ hotList: data.data.pkword })
    })
    .catch(Toast.fail('获取热门搜索数据失败', 2));
}

