import "../index.css";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { ButtonSize } from "../components/buttons/ButtonSize";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <div className="text-center text-4xl">Home</div>
      <div className="mt-10 flex place-items-center justify-center">
        <PrimaryButton
          text="Log In"
          buttonSize={ButtonSize.Medium}
          onClick={() => navigate("/login")}
        />
      </div>
    </>
  );
}

export default App;
