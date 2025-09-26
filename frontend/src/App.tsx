import "./index.css";
import PrimaryButton from "./components/buttons/PrimaryButton";
import { ButtonSize } from "./components/buttons/ButtonSize";

function App() {
  return (
    <>
      <div className="text-center text-4xl">Tahash API Test</div>
      <PrimaryButton text="Small" buttonSize={ButtonSize.Small} />
      <PrimaryButton text="Medium" buttonSize={ButtonSize.Medium} />
      <PrimaryButton text="Large" buttonSize={ButtonSize.Large} />
    </>
  );
}

export default App;
