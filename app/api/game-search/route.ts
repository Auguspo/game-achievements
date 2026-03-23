import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

type GameEntry = {
  appid: number;
  name: string;
};

let gameCatalogCache: GameEntry[] | null = null;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const loadGameCatalog = (): GameEntry[] => {
  if (gameCatalogCache) return gameCatalogCache;

  const filePath = path.join(process.cwd(), "GamesID.json");
  const data = fs.readFileSync(filePath, "utf-8");
  const gamesData = JSON.parse(data);

  if (!gamesData.applist || !Array.isArray(gamesData.applist.apps)) {
    throw new Error("The JSON file does not have the expected structure.");
  }

  gameCatalogCache = gamesData.applist.apps
    .filter((app: { appid: number; name: string }) => app.name && app.name.trim().length > 0)
    .map((app: { appid: number; name: string }) => ({
      appid: app.appid,
      name: app.name,
    }));

  return gameCatalogCache ?? [];
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    const limit = Math.min(Number(searchParams.get("limit") || 10), 20);

    if (!query) {
      return NextResponse.json({ error: "The query parameter is required." }, { status: 400 });
    }

    const catalog = loadGameCatalog();
    const normalizedQuery = normalizeText(query);

    const matches = catalog
      .filter((game) => normalizeText(game.name).includes(normalizedQuery))
      .slice(0, Number.isFinite(limit) && limit > 0 ? limit : 10);

    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    console.error("Error searching games:", error);
    return NextResponse.json({ error: "Error searching games." }, { status: 500 });
  }
}
