// app/api/steam/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';


const apiKey =process.env.NEXT_PUBLIC_STEAM_KEY;
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get('steamId');

  if (!steamId) {
    return NextResponse.json({ error: 'Se requiere un Steam ID' }, { status: 400 });
  }

  try {
    const response = await axios.get(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
    );
   
    return NextResponse.json(response.data, { status: 200 });
  } catch (error : unknown) {
    console.error('Error at API call:', error);
    if(error instanceof AxiosError){
    if (error.response ) {
      console.error('API Response:', error.response.data);
      return NextResponse.json(
        { error: `API Error: ${error.response.data.error}` },
        { status: error.response.status }
      );}
    } else {
      return NextResponse.json({ error: 'Unknown API error' }, { status: 500 });
    }
  }
}
