export const getItems = (baseUrl, collection, crs, token) => {
  //return fetch(`${baseUrl}/collections/${collection}/items/${id}?crs=${crs}`, {
  return fetch(
    `${baseUrl}/collections/${collection}/items?${crs ? "crs=" + crs : ""}`,
    {
      headers: { Accept: "application/geo+json", ...toAuthHeader(token) },
    }
  ).then(parseJson(false));
};

export const getItem = (
  baseUrl,
  collection,
  id,
  crs,
  additionalParams,
  token
) => {
  //return fetch(`${baseUrl}/collections/${collection}/items/${id}?crs=${crs}`, {
  return fetch(
    `${baseUrl}/collections/${collection}/items/${id}?${additionalParams}${
      crs ? "&crs=" + crs : ""
    }`,
    {
      headers: { Accept: "application/geo+json", ...toAuthHeader(token) },
    }
  ).then(parseJson(true));
};

export const postItem = (baseUrl, collection, feature, crs, token) => {
  return fetch(`${baseUrl}/collections/${collection}/items`, {
    headers: {
      "Content-Type": "application/geo+json; charset=utf-8",
      "Content-Crs": `<${crs}>`,
      ...toAuthHeader(token),
    },
    method: "POST",
    body: JSON.stringify(feature),
  })
    .then(checkError)
    .then(parseId);
};

export const putItem = (baseUrl, collection, feature, crs, etag, token) => {
  const headers = {
    "Content-Type": "application/geo+json; charset=utf-8",
    "Content-Crs": `<${crs}>`,
    Accept: "application/json",
    ...toAuthHeader(token),
  };
  if (etag) headers["If-Match"] = etag;

  return fetch(`${baseUrl}/collections/${collection}/items/${feature.id}`, {
    headers,
    method: "PUT",
    body: JSON.stringify(feature),
  }).then(checkError);
};

export const patchItem = (baseUrl, collection, feature, crs, etag, token) => {
  const headers = {
    "Content-Type": "application/geo+json; charset=utf-8",
    "Content-Crs": `<${crs}>`,
    Accept: "application/json",
    ...toAuthHeader(token),
  };
  if (etag) headers["If-Match"] = etag;

  return fetch(`${baseUrl}/collections/${collection}/items/${feature.id}`, {
    headers,
    method: "PATCH",
    body: JSON.stringify(feature),
  }).then(checkError);
};

export const deleteItem = (baseUrl, collection, id, token) => {
  return fetch(`${baseUrl}/collections/${collection}/items/${id}`, {
    headers: toAuthHeader(token),
    method: "DELETE",
  }).then(checkError);
};

export const getSchema = (baseUrl, collection, options, token) => {
  const path = (options && options.custom) || options.replace;

  return fetch(`${baseUrl}/collections/${collection}/${path}`, {
    headers: { Accept: "application/schema+json", ...toAuthHeader(token) },
  }).then(parseJson(false));
};

const parseJson = (withETag) => (response) => {
  console.log("ETag", response.headers.get("etag"));
  return response && response.ok
    ? response.json().then((json) => {
        return withETag
          ? { feature: json, etag: response.headers.get("etag") }
          : json;
      })
    : withETag
    ? { feature: {}, etag: response.headers.get("etag") }
    : {};
};

const parseId = (response) => {
  return response && response.ok
    ? response.headers
        .get("location")
        .substr(response.headers.get("location").lastIndexOf("/") + 1)
    : undefined;
};

const checkError = (response) => {
  if (response.ok) {
    return response;
  }
  if (response.bodyUsed) {
    return response
      .json()
      .then((json) => {
        parseError(response, json.detail);
      })
      .catch(() => {
        parseError(response);
      });
  }

  parseError(response);
};

const parseError = (response, details) => {
  if (response.status === 412) {
  }
  let message = response.status + " " + response.statusText;
  if (details) message += "<br/>" + details;
  throw new Error(message);
};

export const toAuthHeader = (token) => {
  if (token) {
    return {
      Authorization: "Bearer " + token,
    };
  }
  return {};
};
