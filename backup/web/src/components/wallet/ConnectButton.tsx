"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "../ui/button";

export function ConnectButton() {
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  if (isConnected) {
    return (
      <Button variant="outline" onClick={() => disconnect()}>
        Disconnect {address?.slice(0, 6)}...{address?.slice(-4)}
      </Button>
    );
  }

  return (
    <>
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          disabled={isPending}
          onClick={() => connect({ connector })}
        >
          Connect Wallet
          {isPending && " (connecting)"}
        </Button>
      ))}
    </>
  );
}
