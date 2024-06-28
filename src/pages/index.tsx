import { Inter } from "next/font/google";
import Head from "next/head";
import {
  CardanoWallet,
  MeshBadge,
  useAddress,
  useWallet,
} from "@meshsdk/react";
import { useState } from "react";
import { MeshTxBuilder } from "@meshsdk/core";
import { calculateTxHash } from "@meshsdk/core-csl";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [txHex1, setTxHex1] = useState("");
  const [txHex2, setTxHex2] = useState("");
  const [txHash1, setTxHash1] = useState("");
  const [txHash2, setTxHash2] = useState("");
  const [tx1Submitted, setTx1Submitted] = useState(false);
  const [tx2Submitted, setTx2Submitted] = useState(false);
  const address = useAddress();
  const { wallet, connected } = useWallet();

  const handleTx1 = async () => {
    if (connected) {
      const mesh = new MeshTxBuilder({});
      const utxos = await wallet.getUtxos();
      await mesh
        .txOut(address!, [{ unit: "lovelace", quantity: "10000000" }])
        .changeAddress(address!)
        .selectUtxosFrom(utxos)
        .complete();
      const signedTx = await wallet.signTx(mesh.txHex);
      const txHash = calculateTxHash(signedTx);
      setTxHex1(signedTx);
      setTxHash1(txHash);
    }
  };
  const handleTx2 = async () => {
    if (connected) {
      const mesh = new MeshTxBuilder({});
      await mesh
        .txIn(
          txHash1,
          0,
          [{ unit: "lovelace", quantity: "10000000" }],
          address!
        )
        .txOut(address!, [])
        .changeAddress(address!)
        .complete();
      const signedTx = await wallet.signTx(mesh.txHex);
      const txHash = calculateTxHash(signedTx);
      setTxHex2(signedTx);
      setTxHash2(txHash);
    }
  };

  const handleSubmitTxs = async () => {
    console.log("submitting", txHex1);
    const resTxHash1 = await wallet.submitTx(txHex1);
    if (resTxHash1 === txHash1) {
      setTx1Submitted(true);
    }
    console.log("submitting", txHex2);
    const resTxHash2 = await wallet.submitTx(txHex2);
    if (resTxHash2 === txHash2) {
      setTx2Submitted(true);
    }
  };

  return (
    <div className="bg-gray-900 w-full text-white text-center">
      <Head>
        <title>DeltaDeFi - Tx Chaining Prototype</title>
        <meta name="description" content="A Cardano dApp powered my Mesh" />
      </Head>
      <main
        className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className} `}>
        <h1 className="text-6xl font-thin mb-20">
          <a href="https://meshjs.dev/" className="text-sky-600">
            Prototype
          </a>{" "}
          Tx chaining for HFT
        </h1>

        <div className="mb-10">
          <CardanoWallet />
        </div>

        <div className="mb-20 text-xl">
          Here we conduct the prototyping on HFT capability on Cardano, please
          connect the preprod wallet (suggested Eternl or Typhon)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 content-center justify-around ">
          <div className="bg-gray-800 rounded-xl border border-white hover:scale-105 transition max-w-96 p-5 m-5">
            <h2 className="text-2xl font-bold mb-2">Transaction 1</h2>
            <p className="text-gray-400 ">
              This transaction represents the order placing tx, which is not
              submitted immediately after signing
            </p>
            <button
              className="border border-white rounded-lg p-2 m-2"
              onClick={handleTx1}>
              Sign Tx 1
            </button>
            {txHex1 && (
              <div className="m-2">
                <p className="whitespace-break-spaces overflow-hidden overflow-wrap break-word word-wrap break-word">
                  Tx 1 signed - {txHash1}
                </p>
              </div>
            )}
          </div>
          <div className="bg-gray-800 rounded-xl border border-white hover:scale-105 transition max-w-96 p-5 m-5">
            <h2 className="text-2xl font-bold mb-2">Transaction 2</h2>
            <p className="text-gray-400">
              This transaction represents the order placing tx, which is not
              submitted immediately after signing
            </p>
            <button
              className="border border-white rounded-lg p-2 m-2"
              onClick={handleTx2}>
              Sign Tx 2
            </button>
            {txHex2 && (
              <div className="m-2">
                <p className="whitespace-break-spaces overflow-hidden overflow-wrap break-word word-wrap break-word">
                  Tx 2 signed - {txHash2}
                </p>
              </div>
            )}
          </div>
          <div className="bg-gray-800 rounded-xl border border-white hover:scale-105 transition max-w-96 p-5 m-5">
            <h2 className="text-2xl font-bold mb-2">Transaction 1</h2>
            <button
              className="border border-white rounded-lg p-2 m-2"
              onClick={handleSubmitTxs}>
              Submit Tx1 + Tx2
            </button>
            {tx1Submitted && (
              <>
                <p>Click the below to check status</p>
                <a
                  href={`https://preprod.cardanoscan.io/transaction/${txHash1}`}>
                  <p className="text-blue-800 p-2 bg-slate-300 m-2 rounded-sm">
                    Tx1 submitted
                  </p>
                </a>
              </>
            )}
            {tx2Submitted && (
              <a href={`https://preprod.cardanoscan.io/transaction/${txHash2}`}>
                <p className="text-blue-800 p-2 bg-slate-300 m-2 rounded-sm">
                  Tx2 submitted
                </p>
              </a>
            )}
          </div>
        </div>
      </main>
      <footer className="p-8 border-t border-gray-300 flex justify-center">
        <MeshBadge dark={true} />
      </footer>
    </div>
  );
}
