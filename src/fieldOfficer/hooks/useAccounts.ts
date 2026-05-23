import { useEffect, useState } from "react";
import { fetchAccount, fetchAccounts } from "../../shared/api/accounts";
import type { ApiAccount } from "../../shared/api/types";

export function useAccounts() {
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAccounts()
      .then((data) => {
        if (!cancelled) {
          setAccounts(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load accounts");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { accounts, loading, error };
}

export function useAccount(accountId: string | undefined) {
  const [account, setAccount] = useState<ApiAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetchAccount(accountId)
      .then((data) => {
        if (!cancelled) {
          setAccount(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load account");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  return { account, loading, error };
}
