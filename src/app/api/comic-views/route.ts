import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
const key="comic:groy-payne:01:views";
async function counter(increment:boolean){
 const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
 const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
 if(!url||!token)return NextResponse.json({available:false},{status:503});
 try{
 const result=await fetch(url,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify([increment?"INCR":"GET",key]),cache:"no-store"});
 if(!result.ok)throw new Error("Counter unavailable");
 const data=await result.json();if(data.error)throw new Error("Counter unavailable");
 return NextResponse.json({views:Number(data.result||0)},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({available:false},{status:503});}
}
export async function GET(){return counter(false);}
export async function POST(request:Request){
 const origin=request.headers.get("origin");
 if(origin&&new URL(origin).host!==(request.headers.get("x-forwarded-host")||request.headers.get("host")||new URL(request.url).host))return NextResponse.json({error:"Forbidden"},{status:403});
 return counter(true);
}
