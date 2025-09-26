import "./index.css";
import { sendGetRequest } from "../../shared/utils/API/apiUtils";
import { ResponseCode } from "../../shared/types/response-code";

function App() {
  async function sendRequest() {
    const response = await sendGetRequest("/");
    if (response.code != ResponseCode.Success) {
      alert("Invalid response");
      console.error("Invalid response", response.data);
      return;
    }
    alert("Done!");
  }

  return (
    <>
      <div className="text-center text-4xl">Tahash API Test</div>
      <button onClick={sendRequest}>Send request</button>
    </>
  );
}

export default App;
