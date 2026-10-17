# Demo video shot list — `micro-ai`

Target runtime **02:33**. Generated from `src/content/labs/micro-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Curated Microbial Sequencing Datasets — Work with selected sequencing datasets representing diverse microbial communities and varying data-quality conditions.
- Sequence Quality Assessment — Evaluate sequencing quality and key QC indicators to determine whether datasets are suitable for downstream analysis.
- Microbial Community Profiling — Examine taxonomic composition, relative abundance, classified microbial groups, and unclassified reads to characterize community structure.
- Functional Interpretation — Explore predicted biological functions and metabolic potential associated with microbial community profiles.
- Anaerobic Digester Simulation — Modify parameters such as pH, temperature, substrate conditions, and retention time to investigate their influence on simulated digester performance.
- Guided Analysis & Assessment — Follow a structured workflow with guided interpretation and knowledge checks to understand results and progress through each stage of the lab.

## Shots

| In | Out | Chapter | On screen | Say over it |
| --- | --- | --- | --- | --- |
| 00:00 | 00:06 | Why metagenomics is useful | Title card, then Getting started with the three goal cards. | Many microbes are difficult to grow in the lab, so we study the DNA present in the sample instead. |
| 00:06 | 00:13 | Choose what you want to study | Click 'Explore anaerobic digestion', then 'Start with this goal'. | Select the anaerobic digestion goal and load the provided dataset. |
| 00:13 | 00:20 | Check the input first | The Input summary panel: file, size, expected type, detected format, SHA-256. | See the file details before any microbial analysis is shown. |
| 00:20 | 00:27 | Look at what is actually in the file | The Inspection step: record count, length range, measured alphabet. | Check the number of records, sequence length, and sequence content. |
| 00:27 | 00:42 | Run the quality check | The QC route banner, then Run format-specific QC and analysis. | The lab applies quality checks based on the type of sequencing data. |
| 00:42 | 00:49 | Read the QC result | The QC verdict badge and findings list. | Check the read count and the main quality values before moving ahead. |
| 00:49 | 00:55 | See which analyses are possible | The eligibility table: Eligible, Eligible with limitations, Module not built. | The lab shows which analyses can be used with the dataset and why. |
| 00:55 | 01:05 | See which microbes are present | Community profile: the phylum pie and the abundant-species bar graph. | View the main microbial groups in the sample and their relative abundance. |
| 01:05 | 01:14 | Look inside a microbial group | Click the Euryarchaeota chip; the species-level graph opens beneath. | Select a phylum to see the species classified within it. |
| 01:14 | 01:25 | Understand what is inferred | Functional potential, with the red banner in frame. | Functional potential is based on the organisms identified in the sample; it is not the same as directly detecting a gene. |
| 01:25 | 01:32 | Follow the stages of anaerobic digestion | Traits and guilds, the four stages in process order. | See the main microbial groups linked with each stage of the process. |
| 01:32 | 01:46 | Open the digester model | Bioreactor, Educational Simulator, defaults at 37 degrees and pH 7. | Use the simulator to see how the model responds under different conditions. |
| 01:46 | 01:50 | Start with the baseline | The result tiles: total yield, methane content, stability risk. | Check the starting values for biogas yield, methane content, and stability. |
| 01:50 | 02:04 | Change the pH | Set pH to 5.5 and run again. | Lower the pH and see how the simulated digester responds. |
| 02:04 | 02:09 | Compare the change | The collapsed result beside the mandatory label. | Look at how the yield and methane values change. These are simulation results, not real-plant predictions. |
| 02:09 | 02:22 | Complete the Basic Mode assessment | Assessment, answering and submitting. | Use the assessment to check what you understood from the workflow. |
| 02:22 | 02:28 | Move to Moderate Mode | The Unlock Moderate Mode button appearing. | After completing the assessment, you can unlock the next level. |
| 02:28 | 02:33 | Continue to the next level | Moderate unlocked in the sidebar, Advanced still locked. | Moderate Mode is unlocked after assessment. Advanced Mode is available separately. |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Fewer than one microbe in a hundred will grow in a laboratory dish, so most of what lives in soil, sludge or a human gut has never been cultured. Metagenomics gets around that by skipping cultivation entirely: extract all the DNA in a sample at once and read it. This lab takes you through that workflow end to end — inspect the sequence file, quality-control it, find out which organisms are there and in what proportion, work out what that community could do chemically, and then run an anaerobic digester to see how temperature, pH, feedstock and retention time change how much methane those organisms give you.

**Then work the 8 tutorial steps** (78 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Understand the Lab Objectives

_Begin by familiarizing yourself with the scientific objectives and analytical workflow of Microbe Lab._

Show, in order:

- Review the three core objectives: Microbial Communities, Functional Prediction, and Bioreactor Simulation.
- Explore how microbial community composition, metabolic potential, and bioreactor operating conditions are related.

**Hold the shot on:** An overview of the lab objectives and the sequence of analyses.

**Say over it:** Understanding these connections provides a foundation for interpreting microbial ecology and anaerobic digestion processes.

### 2. Start Experiment

_Begin your investigation by selecting a microbial sequencing dataset._

Show, in order:

- Select Run New Experiment to initiate the analysis.
- Navigate to Input Data and choose the available anaerobic-digester dataset.
- Review the dataset description and sample information.

**Hold the shot on:** The selected dataset and its associated information, ready for quality assessment.

**Say over it:** Understanding the origin and characteristics of a dataset is essential for reliable interpretation of microbial community profiles.

### 3. Assess Data Quality & Eligibility

_Evaluate the quality and suitability of the sequencing data before proceeding with biological analysis._

Show, in order:

- Open QC & Eligibility and review the Input Summary and Content Inspection.
- Examine the available quality indicators and sequence characteristics.
- Review Analysis Eligibility to identify supported analyses and potential data limitations.

**Hold the shot on:** A summary of data characteristics, quality indicators, and analysis eligibility.

**Say over it:** Quality assessment helps establish the reliability of the input data and the types of scientific conclusions it can support.

### 4. Characterize the Microbial Community

_Investigate the taxonomic composition and relative abundance of microorganisms within the sample._

Show, in order:

- Open Microbial Community Profile to explore the classified microbial groups.
- Examine taxonomic distributions at different classification levels.
- Compare dominant and less abundant microbial groups, including the proportion of unclassified sequences.

**Hold the shot on:** Taxonomic profiles illustrating microbial composition and relative abundance patterns.

**Say over it:** Community profiling provides insights into microbial diversity and composition. Relative abundance, however, should not be interpreted as a direct measure of microbial activity or biomass.

### 5. Investigate Microbial Functional Potential

_Explore the potential metabolic capabilities of the identified microbial community._

Show, in order:

- Open Functional Potential to examine inferred biological functions.
- Explore the four principal stages of anaerobic digestion: hydrolysis, acidogenesis, acetogenesis, and methanogenesis.
- Review potential microbial contributions to organic matter degradation and methane formation.

**Hold the shot on:** Inferred functional pathways associated with anaerobic digestion.

**Say over it:** Functional predictions provide insight into potential microbial capabilities but do not establish whether the corresponding metabolic processes are active.

### 6. Examine Microbial Traits & Functional Guilds

_Explore how microbial groups may contribute to different stages of anaerobic digestion._

Show, in order:

- Open Microbial Traits and Functional Guilds.
- Examine inferred microbial traits associated with substrate degradation, intermediate metabolite transformation, and methanogenesis.
- Review functional guild assignments and the taxonomic evidence supporting them.

**Hold the shot on:** Microbial groups organized according to their inferred metabolic characteristics and ecological roles.

**Say over it:** Functional guild analysis helps explain the potential contributions of different microorganisms to anaerobic digestion and their possible metabolic relationships.

### 7. Explore Bioreactor Simulation

_Investigate how operating conditions may influence anaerobic digestion and simulated biogas production._

Show, in order:

- Open Bioreactor and begin with the default operating conditions.
- Modify temperature, pH, hydraulic retention time (HRT), and organic loading individually.
- Observe and compare the simulated responses under different conditions.

**Hold the shot on:** Model-generated changes in biogas production and reactor performance indicators.

**Say over it:** Simulation provides a controlled environment for examining how operating parameters influence anaerobic digestion. Results represent model-based estimates rather than validated predictions of actual plant performance.

### 8. Interpret & Review Your Results

_Consolidate the findings to develop an integrated understanding of microbial communities and anaerobic digestion._

Show, in order:

- Review the microbial community composition and inferred functional potential.
- Examine the relationship between microbial traits, functional guilds, and simulated bioreactor performance.
- Identify important trends while considering data limitations and model assumptions.
- Select My Experiments to access and review your saved analyses.

**Hold the shot on:** A consolidated record of your microbial analyses and bioreactor simulation results.

**Say over it:** Integrating taxonomic, functional, and simulation findings supports a more comprehensive understanding of microbial ecology and its potential relevance to biogas production.

## Close with

- Identify the type of sequencing data from the information available in a file.
- Read a quality-control report and understand whether the data are suitable for further analysis.
- Explore a microbial community profile and interpret relative abundance and unclassified reads.
- Compare an analysed microbial community with a mock community of known composition.
- Distinguish between detected and inferred results.
- Describe the main microbial stages involved in anaerobic digestion.
- Explore how pH, temperature, substrate, and hydraulic retention time affect the digester simulation.
- Compare microbial profiles from normal and stressed digester conditions.

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `micro-ai.mp4` and `micro-ai.jpg`.
3. In `src/content/labs/micro-ai.ts`, set `video.url` to `"/demos/micro-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.
