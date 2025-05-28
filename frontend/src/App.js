import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch('http://localhost:5000/')
      .then(res => res.text())
      .then(data => console.log(data));
  }, []);
  return <div>Live Locator App</div>;
}

export default App;
