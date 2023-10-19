const makeApiCall = async (url, method = "GET", body, headers = {}, isImage = false) => {
  const updatedHeaders = { ...headers };

  if (isImage) {
    delete updatedHeaders["Content-type"];
  } else {
    updatedHeaders["Content-type"] = "application/json";
  }

  const options = {
    method,
    headers: updatedHeaders,
    body
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      console.log("Response not OK")
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    console.log("Response OK, Res: ", response)
    return response;
  } catch (error) {
    console.error("API call failed:", error.message);
    throw new Error(`Error: ${error} - ${error}`);
  }
};

export default makeApiCall;
