# Demo video shot list — `cognicore-ai`

Target runtime **00:51**. Generated from `src/content/labs/cognicore-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- A document to work with. The lab ships samples; if you bring your own, use nothing confidential — it is processed by a language model provider
- For the comparison mode, two versions of the same document
- About 50 minutes

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:09 | Choosing a workspace profile | _fill in during storyboard_ |
| 00:09 | 00:21 | Legal Lens and Finance Flow modules | _fill in during storyboard_ |
| 00:21 | 00:38 | Opening the document workbench | _fill in during storyboard_ |
| 00:38 | 00:51 | Analyze, Compare and Clause Atlas modes | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Contracts, invoices and financial reports are long, repetitive, and expensive to read carefully — which is why important details in them get missed. This lab is a document-intelligence workbench: upload a document and get it summarised, put two versions side by side and get the differences that matter surfaced, or search a whole corpus for a clause by meaning rather than by keyword. It ships two modules, one tuned for legal documents and one for financial ones.

**Then work the 6 tutorial steps** (62 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Choose a domain module

_Enter the workbench tuned for the kind of document you have._

Show, in order:

- Sign in and look at the module cards on the landing page.
- Choose Legal Lens AI for contracts and agreements, or Finance Flow AI for invoices, statements and reports.
- Note that module access is governed by your permissions — you may not see both.

**Hold the shot on:** The workbench opens with a mode switch offering Analyze Document, Compare Documents and Search Clause Atlas.

**Say over it:** The two modules differ in their system instructions and suggested prompts, not in their mechanics. A legal summariser is told to watch for obligations, liabilities and termination rights; a financial one for figures, periods and anomalies. Using the wrong one still works, just less well.

### 2. Analyze a single document

_Get a first summary and, more importantly, learn to check it._

Show, in order:

- Stay in Analyze Document mode and upload a document into the slot.
- Wait for the automatic summary — it runs as soon as a document is loaded.
- Read the summary, then open the document preview alongside it.
- Pick three specific claims from the summary and verify each against the source.

**Hold the shot on:** A structured summary appears without you prompting. Most claims check out; occasionally one is subtly overstated.

**Say over it:** Verification is the whole discipline. Summaries are fluent and confident regardless of accuracy, so fluency carries no information about correctness. Building the habit of spot-checking three claims — every time — is the single most valuable thing to take away from this lab.

### 3. Prompt for something specific

_See how much the question shapes the usefulness of the answer._

Show, in order:

- Try one of the suggested prompts to see the expected format.
- Now write a vague one: "tell me about this document". Note how generic the response is.
- Write a precise one instead: "list every obligation this agreement places on the supplier, with the clause number for each".
- Compare the two responses for how easy each is to check.

**Hold the shot on:** The vague prompt returns readable but unverifiable prose. The precise one returns a list you can walk through against the document.

**Say over it:** A response you cannot check is worth very little, however good it sounds. Asking for clause numbers, figures and quotations forces the model to anchor to the source and gives you the means to catch it when it does not.

### 4. Compare two versions

_Find the changes that matter between drafts._

Show, in order:

- Switch the mode to Compare Documents.
- Load version one into Document One and version two into Document Two.
- Let the automatic comparison run, then ask specifically which changes alter the parties' obligations.
- Check the comparison against the actual documents — particularly for changes it did *not* mention.

**Hold the shot on:** A comparison distinguishing substantive changes from formatting or renumbering.

**Say over it:** Omission is the failure mode to watch here, and it is much harder to spot than invention. A missing change reads as a clean comparison, so if the stakes are real, a diff tool should be run alongside this — one finds the meaning, the other guarantees completeness.

### 5. Search a corpus by meaning

_Use the capability keyword search cannot reproduce._

Show, in order:

- Switch to Search Clause Atlas and upload several documents into the corpus.
- Search for a concept rather than a phrase — "what happens if either side wants to end this early".
- Note that matches come back which never use the words you typed.
- Now search for a term you know appears verbatim and check that it is also found.

**Hold the shot on:** Concept searches return relevant clauses phrased entirely differently, ranked by semantic similarity.

**Say over it:** The retrieval works on embeddings — numerical representations where similar meanings sit close together — so it matches ideas rather than characters. The corresponding weakness is that it can rank something topically related but legally irrelevant above an exact match, which is why the exact-term check in the last action matters.

### 6. Probe the failure modes deliberately

_Learn where not to trust the system before it matters._

Show, in order:

- Ask about something the document does not contain and see whether you get a hedge or an invention.
- Find a clause with a negation or a double negative and ask about it directly.
- Ask for a specific figure and check it digit by digit.
- Ask a question whose answer depends on two clauses far apart in the document.

**Hold the shot on:** Negations and long-range dependencies are where errors cluster. Absent information sometimes produces a confident answer rather than an admission.

**Say over it:** These failures are structural, not bugs. Negation flips meaning with very little surface signal, and questions requiring two distant clauses depend on both landing in the retrieved context at once. Knowing this tells you which answers to verify hardest.

## Close with

- Summarise a long document and check the summary against the source rather than trusting it
- Compare two versions and identify substantive changes as distinct from cosmetic ones
- Search a corpus by meaning and explain why that finds clauses keyword search misses
- Write prompts that produce specific, checkable output instead of generic prose
- Describe where these systems fail — hallucinated citations, missed negations, lost context

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `cognicore-ai.mp4` and `cognicore-ai.jpg`.
3. In `src/content/labs/cognicore-ai.ts`, set `video.url` to `"/demos/cognicore-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.
