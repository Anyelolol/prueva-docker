export default function ScoreBadge({ score }) {
  if (score === null || score === undefined) return <span className="badge badge-info">—</span>
  const pct = Math.round(score * 100)
  if (pct >= 70) return <span className="badge badge-danger">{pct}%</span>
  if (pct >= 40) return <span className="badge badge-warning">{pct}%</span>
  return <span className="badge badge-success">{pct}%</span>
}
