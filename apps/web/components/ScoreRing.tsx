export function ScoreRing({score}:{score:number}){
  const deg=Math.round(score*3.6);
  return <div className="score-ring" style={{"--score":`${deg}deg`} as React.CSSProperties}><span>{score}</span></div>
}
