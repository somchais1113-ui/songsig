import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if(request.nextUrl.pathname.startsWith("/api/cron/")) return NextResponse.next();
  const user=process.env.APP_BASIC_AUTH_USER;
  const pass=process.env.APP_BASIC_AUTH_PASSWORD;
  if(!user || !pass) return NextResponse.next();

  const auth=request.headers.get("authorization");
  if(auth?.startsWith("Basic ")){
    try{
      const decoded=atob(auth.slice(6));
      const separator=decoded.indexOf(":");
      const suppliedUser=decoded.slice(0,separator);
      const suppliedPass=decoded.slice(separator+1);
      if(suppliedUser===user && suppliedPass===pass) return NextResponse.next();
    }catch{}
  }
  return new NextResponse("Authentication required",{status:401,headers:{"WWW-Authenticate":'Basic realm="Consumer Signal Engine"'}});
}

export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
