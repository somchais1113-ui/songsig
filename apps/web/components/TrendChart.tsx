"use client";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { trendData } from "@/lib/data";

export function TrendChart(){
  return <div className="chart-wrap">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={trendData} margin={{top:10,right:8,left:-24,bottom:0}}>
        <defs>
          <linearGradient id="signalFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#155eef" stopOpacity={0.28}/>
            <stop offset="100%" stopColor="#155eef" stopOpacity={0.02}/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#edf1f7" vertical={false}/>
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize:11,fill:"#667085"}}/>
        <YAxis axisLine={false} tickLine={false} tick={{fontSize:11,fill:"#667085"}}/>
        <Tooltip contentStyle={{borderRadius:12,border:"1px solid #dfe6f3",boxShadow:"0 8px 24px rgba(9,17,31,.08)"}}/>
        <Area type="monotone" dataKey="signals" stroke="#155eef" strokeWidth={2.5} fill="url(#signalFill)"/>
      </AreaChart>
    </ResponsiveContainer>
  </div>
}
