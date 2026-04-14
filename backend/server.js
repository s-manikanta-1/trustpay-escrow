require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { algosdk, algodClient } = require("./escrow");

const app = express();
app.use(cors());
app.use(express.json());

let escrowData = {};

// CREATE ESCROW
app.post("/create-escrow", async (req, res) => {
  try {
    const freelancer = req.body.freelancer.trim();

    const program = `
#pragma version 5
txn CloseRemainderTo
global ZeroAddress
==
txn RekeyTo
global ZeroAddress
==
&&
txn Receiver
addr ${freelancer}
==
&&
txn TypeEnum
int pay
==
&&
return
    `;

    const encoder = new TextEncoder();
    const compiled = await algodClient.compile(encoder.encode(program)).do();

    const programBuffer = new Uint8Array(
      Buffer.from(compiled.result, "base64")
    );

    const lsig = new algosdk.LogicSigAccount(programBuffer);

    escrowData = {
      address: lsig.address().toString(),
      lsig,
      receiver: freelancer,
    };

    res.json({ escrowAddress: escrowData.address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RELEASE PAYMENT
app.post("/release-payment", async (req, res) => {
  try {
    console.log("Escrow Data:", escrowData); 

    if (!escrowData.address) {
      return res.status(400).json({ error: "Escrow not created yet" });
    }

    const params = await algodClient.getTransactionParams().do();

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: escrowData.address,
      receiver: escrowData.receiver,
      amount: 400000,
      suggestedParams: params,
    });

    const signedTxn = algosdk.signLogicSigTransactionObject(
      txn,
      escrowData.lsig
    );

    const txId = txn.txID().toString();

    await algodClient.sendRawTransaction(signedTxn.blob).do();

    res.json({ txId });

  } catch (err) {
    console.error(" RELEASE ERROR:", err); 
    res.status(500).json({ error: err.message });
  }
});

// TEST
app.get("/", (req, res) => {
  res.send("Backend running ");
});

app.listen(3000, () => {
  console.log("Server running on port 3000 ");
});