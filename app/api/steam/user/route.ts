// app/api/steam/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get('steamId');

  if (!steamId) {
    return NextResponse.json({ error: 'Se requiere un Steam ID' }, { status: 400 });
  }

  try {
    const response = await axios.get(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=3608B8097FDD594B191A6845C5984509&steamids=${steamId}`
    );
    console.log('API Response:', response.data);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error at API call:', error);
    if (error.response) {
      console.error('API Response:', error.response.data);
      return NextResponse.json(
        { error: `API Error: ${error.response.data.error}` },
        { status: error.response.status }
      );
    } else {
      return NextResponse.json({ error: 'Unknown API error' }, { status: 500 });
    }
  }
}
