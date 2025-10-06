import React, { useEffect, useState } from "react";

// query parameters:
// text = the error text
// data = a stringyfied json of the data
function Error() {
  const [text, setText] = useState("");
  const [data, setData] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorText = urlParams.get("text");
    if (errorText) setText(decodeURIComponent(errorText));
    else setText("Error");

    const urlData = urlParams.get("data");
    if (urlData) setData(decodeURIComponent(urlData));
    else setData("No additional data");
  }, []);

  return (
    <div>
      <p className="text-center text-5xl font-bold text-red-500">Error</p>
      <br />
      <br />
      <p className="text-center text-4xl font-semibold text-black">{text}</p>
      <br />
      <br />
      <p className="text-center text-3xl text-gray-700">{data}</p>
    </div>
  );
}

export default Error;
