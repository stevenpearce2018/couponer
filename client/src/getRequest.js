
const getRequest = async url => {
  try {
    const data = await fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, same-origin, *omit
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
  })
  return data.json()     
  } catch (error) {
      console.log(error)
  }
}

export default getRequest;