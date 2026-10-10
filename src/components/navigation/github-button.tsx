"use client";
import { useEffect, useState } from "react";
import { githubProject } from "@/config/nav";

export function GitHubButton({ onClick }: { onClick?: () => void }) {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/github-stars", { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (Number.isSafeInteger(data?.stars) && data.stars >= 0) setStars(data.stars); })
      .catch(() => { /* Keep the repository link usable when GitHub is unavailable. */ });
    return () => controller.abort();
  }, []);
  return <a className="nd-github" href={githubProject.href} target="_blank" rel="noopener noreferrer" onClick={onClick} aria-label={stars === null ? githubProject.description : `${githubProject.description}, ${stars} stars`}>
    <span className="nd-github-icon" aria-hidden="true" />
    <span>{githubProject.label}</span><span className="nd-github-count" aria-hidden="true">{stars !== null && <>☆ {stars.toLocaleString("en-US")}</>}</span>
  </a>;
}
