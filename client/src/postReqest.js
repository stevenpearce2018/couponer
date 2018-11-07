const postRequest = async(url, data) =>{
    try {
        const response = await fetch(url, {
            method: "POST", 
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(data),
          })
          return await response.json();      
    } catch (error) {
        console.log(error)
    }
}

export default postRequest;