"use client";

import SteamSearch from "@/components/SteamSearch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <Card className="mx-auto max-w-2xl border-slate-300/80 bg-white/85 backdrop-blur shadow-lg dark:border-slate-700 dark:bg-slate-900/85">
      <CardHeader className="space-y-2">
        <CardTitle className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Find your next achievement target
        </CardTitle>
        <CardDescription className="text-center text-base text-slate-600 dark:text-slate-400">
          Search by username or Steam ID, filter your games, and prioritize pending achievements by global rarity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SteamSearch />
      </CardContent>
    </Card>
  );
}
