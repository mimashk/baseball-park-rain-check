import "server-only";

type FetchQueryApiOptions = {
  revalidate?: number;
};

export class QueryApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const QUERY_API_BASE_URL = process.env.QUERY_API_BASE_URL!;
const QUERY_API_BEARER_TOKEN = process.env.QUERY_API_BEARER_TOKEN!;

export async function fetchQueryApiJson<T>(
  path: string,
  options: FetchQueryApiOptions = {}
): Promise<T> {
  if (!QUERY_API_BASE_URL)
    throw new Error("QUERY_API_BASE_URL が設定されていません");
  if (!QUERY_API_BEARER_TOKEN)
    throw new Error("QUERY_API_BEARER_TOKEN が設定されていません");

  const res = await fetch(new URL(path, QUERY_API_BASE_URL), {
    headers: { Authorization: `Bearer ${QUERY_API_BEARER_TOKEN}` },
    next: { revalidate: options.revalidate ?? 300 },
  });

  if (!res.ok) {
    throw new QueryApiError(
      `クエリAPIでデータ取得に失敗しました: ${res.status}`,
      res.status
    );
  }

  return res.json() as Promise<T>;
}
