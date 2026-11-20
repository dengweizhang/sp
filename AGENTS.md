# Agent instructions for SP site

## SAS quick notes

When updating `public/sas-notes/index.html` or when the user asks to capture, summarize, or add SAS/SP programming learnings to the SP notes site, **read and follow**:

`.agents/skills/sp-sas-field-notes/SKILL.md`

Key invariant: every note is indexed `01`, `02`, `03`… consistently in TOC and body; keep entries as short as possible without sacrificing correctness. Confirm code-level changes separately from live Cloudflare deployment.

Do not write confidential CRO/clinical trial data to this public repository.

## SAS learning tracks

When the user wants a complete foundational-to-advanced tutorial for PROC SQL, PROC FREQ, descriptive statistics, PROC POWER, or SAS graphics, read the same Skill and follow the two-tier architecture. Maintain `public/sas-learning/` topic pages, keep short practical tips inside `/sas-notes/`, and update the knowledge index, sitemap, and roadmap as needed. Use public/synthetic SAS data; mark examples not run in the user's environment.
