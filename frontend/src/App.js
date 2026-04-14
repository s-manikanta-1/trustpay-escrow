import { useState } from "react";
import axios from "axios";

function App() {
  const [receiver, setReceiver] = useState("");
  const [escrow, setEscrow] = useState("");
  const [status, setStatus] = useState("");

  const createEscrow = async () => {
  try {
    
    
    const res = await axios.post("http://localhost:3000/create-escrow", {
      freelancer: receiver.trim(),
    });

    setEscrow(res.data.escrowAddress);
  } catch (err) {
    console.error(err);
    setStatus("Error: " + err.response?.data?.error || err.message);
  }
};
  const releasePayment = async () => {
    try {
      setStatus("Releasing payment...");
      const res = await axios.post("http://localhost:3000/release-payment");

      setStatus("Payment Released : " + res.data.txId);
    } catch (err) {
      console.error(err);
     setStatus("Error: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={styles.container}>
      <h1>💰 TrustPay — Decentralized Escrow</h1>
<p style={{ color: "#94a3b8" }}>
  Secure, trustless payments using Algorand blockchain
</p>

      <div style={styles.card}>
        <h3>Create Escrow</h3>
        <input
          placeholder="Freelancer Address"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          style={styles.input}
        />
        <button onClick={createEscrow} style={styles.button}>
          Create Escrow
        </button>
        <p style={{ wordBreak: "break-all", fontSize: "12px" }}>
  Escrow: {escrow}
</p>
      </div>

      <div style={styles.card}>
        <h3>Release Payment</h3>
        <button onClick={releasePayment} style={styles.button}>
          Release 0.5 ALGO
        </button>
       <p style={{ 
  wordBreak: "break-all",
  fontSize: "12px",
  marginTop: "10px",
  color: "#22c55e"
}}>
  {status}
</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    padding: "20px",
  },
  card: {
    background: "#1e293b",
    padding: "20px",
    margin: "20px auto",
    width: "300px",
    borderRadius: "10px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
  },
  button: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    background: "#22c55e",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default App;