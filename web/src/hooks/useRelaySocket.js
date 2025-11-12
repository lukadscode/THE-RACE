import { useEffect } from "react";
import { connectRelay } from "../engine/ergClient.js";

export default function useRelaySocket() {
  useEffect(() => {
    const ws = connectRelay();
    return () => ws.close();
  }, []);
}
