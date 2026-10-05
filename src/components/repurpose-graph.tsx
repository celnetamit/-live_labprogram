"use client";

import { useMemo, useState } from "react";

/*
  The RepurposeAI teaching graph, whole.

  Every node and every edge here is read out of
  `repurposeai-api/app/data/curated_graph.json` in the RepurposeAI repository —
  the same file the lab itself queries. Nothing is added to make the picture
  fuller: 65 entities, 94 relations, and the seven sources named in the legend
  are what that file contains. Edges carry the evidence tier the curators
  recorded, which is why most of the graph is "approved" and only five edges
  are preclinical.

  Positions are baked rather than solved in the browser. A force layout run on
  mount would cost a frame budget on a marketing page and, worse, would settle
  somewhere slightly different on every visit, so two people describing the
  same picture would not be describing the same picture. The generator is a
  seeded spring-electrical pass followed by a collision-relaxation pass in
  final pixel space — the first finds the structure, the second guarantees no
  two discs overlap, which the energy minimum alone does not.

      node scratch/layout.cjs && node scratch/emit.cjs

  Re-run both and paste the result if the curated graph changes. The layout is
  deterministic: the same input gives byte-identical output.
*/

  // 65 entities, 94 relations, 6 components, 56 labels placed without collision
  // kinds {"d":18,"g":20,"s":19,"e":8} · evidence {"approved":70,"clinical":19,"preclinical":5}
  // sources: Clinical literature, DisGeNET, DrugBank, FDA, Literature, RECOVERY trial, SIDER
const NODES = [
  { id: "aspirin", n: "Aspirin", t: "d", r: "DB00945", d: "Irreversible COX inhibitor; antiplatelet at low dose.", g: 4, l: "l", x: 479.4, y: 181.4 },
  { id: "metformin", n: "Metformin", t: "d", r: "DB00331", d: "First-line biguanide for type 2 diabetes.", g: 2, l: "r", x: 49.3, y: 417.2 },
  { id: "sildenafil", n: "Sildenafil", t: "d", r: "DB00203", d: "PDE5 inhibitor; developed for angina, repurposed twice.", g: 3, l: "t", x: 327.4, y: 27.5 },
  { id: "atorvastatin", n: "Atorvastatin", t: "d", r: "DB01076", d: "HMG-CoA reductase inhibitor.", g: 3, l: "r", x: 703.1, y: 308.3 },
  { id: "thalidomide", n: "Thalidomide", t: "d", r: "DB01041", d: "Cereblon modulator; withdrawn for teratogenicity, later repurposed.", g: 5, l: "r", x: 250.6, y: 228.9 },
  { id: "minoxidil", n: "Minoxidil", t: "d", r: "DB00350", d: "ATP-sensitive potassium channel opener.", g: 4, l: "b", x: 174.5, y: 54.3 },
  { id: "raloxifene", n: "Raloxifene", t: "d", r: "DB00481", d: "Selective estrogen receptor modulator.", g: 3, l: "r", x: 206.5, y: 312.6 },
  { id: "tamoxifen", n: "Tamoxifen", t: "d", r: "DB00675", d: "Selective estrogen receptor modulator.", g: 3, l: "r", x: 201.8, y: 336.3 },
  { id: "baricitinib", n: "Baricitinib", t: "d", r: "DB11817", d: "JAK1/JAK2 inhibitor with three separate approvals.", g: 7, l: "l", x: 368.4, y: 269.9 },
  { id: "colchicine", n: "Colchicine", t: "d", r: "DB01394", d: "Tubulin-binding anti-inflammatory.", g: 4, l: "l", x: 551.1, y: 277.8 },
  { id: "dexamethasone", n: "Dexamethasone", t: "d", r: "DB01234", d: "Long-acting glucocorticoid.", g: 4, l: null, x: 417.1, y: 229.9 },
  { id: "celecoxib", n: "Celecoxib", t: "d", r: "DB00482", d: "Selective COX-2 inhibitor.", g: 3, l: null, x: 475.9, y: 201.3 },
  { id: "propranolol", n: "Propranolol", t: "d", r: "DB00571", d: "Non-selective beta blocker.", g: 4, l: null, x: 86.9, y: 42.1 },
  { id: "amantadine", n: "Amantadine", t: "d", r: "DB00915", d: "Influenza A antiviral, repurposed for Parkinson disease.", g: 1, l: "r", x: 330.1, y: 84.7 },
  { id: "bupropion", n: "Bupropion", t: "d", r: "DB01156", d: "Norepinephrine-dopamine reuptake inhibitor.", g: 2, l: "l", x: 512.9, y: 28.8 },
  { id: "donepezil", n: "Donepezil", t: "d", r: "DB00843", d: "Reversible acetylcholinesterase inhibitor.", g: 2, l: "r", x: 904.8, y: 381.7 },
  { id: "losartan", n: "Losartan", t: "d", r: "DB00678", d: "Angiotensin II receptor blocker.", g: 2, l: "r", x: 138.6, y: 98.9 },
  { id: "naltrexone", n: "Naltrexone", t: "d", r: "DB00704", d: "Opioid receptor antagonist.", g: 2, l: "l", x: 675.9, y: 40.2 },
  { id: "PTGS1", n: "PTGS1 (COX-1)", t: "g", r: "HGNC:9604", d: "Constitutive cyclooxygenase; gastric mucosal protection.", g: 2, l: "r", x: 495.2, y: 136.5 },
  { id: "PTGS2", n: "PTGS2 (COX-2)", t: "g", r: "HGNC:9605", d: "Inducible cyclooxygenase; inflammation and tumour biology.", g: 4, l: "r", x: 496.1, y: 208.4 },
  { id: "PDE5A", n: "PDE5A", t: "g", r: "HGNC:8784", d: "cGMP-specific phosphodiesterase; vascular smooth muscle.", g: 3, l: "b", x: 327.4, y: 49.3 },
  { id: "HMGCR", n: "HMGCR", t: "g", r: "HGNC:5006", d: "Rate-limiting enzyme of cholesterol biosynthesis.", g: 3, l: "r", x: 698.1, y: 327.2 },
  { id: "PRKAA1", n: "PRKAA1 (AMPK α1)", t: "g", r: "HGNC:9376", d: "Catalytic subunit of the cellular energy sensor AMPK.", g: 3, l: "r", x: 88.6, y: 404.7 },
  { id: "CRBN", n: "CRBN (Cereblon)", t: "g", r: "HGNC:30185", d: "Substrate receptor of a CUL4 E3 ubiquitin ligase.", g: 3, l: "r", x: 260.3, y: 199.2 },
  { id: "ESR1", n: "ESR1", t: "g", r: "HGNC:3467", d: "Estrogen receptor alpha.", g: 4, l: "l", x: 171.8, y: 342.6 },
  { id: "JAK1", n: "JAK1", t: "g", r: "HGNC:6190", d: "Janus kinase; cytokine receptor signalling.", g: 3, l: "r", x: 406, y: 285.6 },
  { id: "JAK2", n: "JAK2", t: "g", r: "HGNC:6192", d: "Janus kinase; haematopoietic cytokine signalling.", g: 3, l: null, x: 411.5, y: 266.3 },
  { id: "TUBB", n: "TUBB", t: "g", r: "HGNC:20778", d: "Beta-tubulin; microtubule assembly.", g: 2, l: "t", x: 586.4, y: 287 },
  { id: "NR3C1", n: "NR3C1", t: "g", r: "HGNC:7978", d: "Glucocorticoid receptor.", g: 3, l: "r", x: 422.1, y: 210.3 },
  { id: "ADRB2", n: "ADRB2", t: "g", r: "HGNC:286", d: "Beta-2 adrenergic receptor.", g: 4, l: null, x: 80.9, y: 62 },
  { id: "ACHE", n: "ACHE", t: "g", r: "HGNC:108", d: "Acetylcholinesterase.", g: 2, l: "r", x: 909.9, y: 362.3 },
  { id: "APOE", n: "APOE", t: "g", r: "HGNC:613", d: "Apolipoprotein E; ε4 allele is the major late-onset AD risk factor.", g: 2, l: "r", x: 815, y: 347.8 },
  { id: "AGTR1", n: "AGTR1", t: "g", r: "HGNC:336", d: "Angiotensin II receptor type 1.", g: 2, l: "l", x: 118.8, y: 100.6 },
  { id: "OPRM1", n: "OPRM1", t: "g", r: "HGNC:8156", d: "Mu-opioid receptor.", g: 2, l: "r", x: 697, y: 29.5 },
  { id: "KCNJ8", n: "KCNJ8", t: "g", r: "HGNC:6269", d: "Inward-rectifier K+ channel subunit of the K-ATP channel.", g: 3, l: "r", x: 157, y: 39.8 },
  { id: "SLC6A2", n: "SLC6A2 (NET)", t: "g", r: "HGNC:11048", d: "Norepinephrine transporter.", g: 2, l: "l", x: 526.7, y: 47.9 },
  { id: "TNF", n: "TNF", t: "g", r: "HGNC:11892", d: "Tumour necrosis factor; pro-inflammatory cytokine.", g: 2, l: "r", x: 437.3, y: 270 },
  { id: "IL6", n: "IL6", t: "g", r: "HGNC:6018", d: "Interleukin 6; drives the acute phase response.", g: 3, l: "l", x: 370.7, y: 227.6 },
  { id: "t2dm", n: "Type 2 Diabetes", t: "s", r: "MeSH:D003924", d: "Insulin resistance with relative insulin deficiency.", g: 2, l: "r", x: 59.8, y: 434 },
  { id: "pah", n: "Pulmonary Arterial Hypertension", t: "s", r: "MeSH:D000081029", d: "Elevated pressure in the pulmonary arteries. Distinct from essential hypertension.", g: 2, l: null, x: 350.7, y: 38.4 },
  { id: "hypertension", n: "Essential Hypertension", t: "s", r: "MeSH:D000075222", d: "Chronically raised systemic arterial pressure.", g: 6, l: "b", x: 126.3, y: 64.3 },
  { id: "ed", n: "Erectile Dysfunction", t: "s", r: "MeSH:D007172", d: "Impaired penile erection, frequently vascular in origin.", g: 2, l: null, x: 304, y: 38.4 },
  { id: "alzheimers", n: "Alzheimer Disease", t: "s", r: "MeSH:D000544", d: "Progressive neurodegeneration with amyloid and tau pathology.", g: 3, l: "l", x: 871.7, y: 362.7 },
  { id: "breast_cancer", n: "Breast Cancer", t: "s", r: "MeSH:D001943", d: "Most cases are hormone receptor positive.", g: 3, l: "r", x: 144.1, y: 370.1 },
  { id: "myeloma", n: "Multiple Myeloma", t: "s", r: "MeSH:D009101", d: "Malignancy of plasma cells.", g: 3, l: "r", x: 300.7, y: 215.6 },
  { id: "aga", n: "Androgenetic Alopecia", t: "s", r: "MeSH:D000505", d: "Patterned hair loss driven by androgens.", g: 2, l: "r", x: 184.1, y: 26 },
  { id: "alopecia_areata", n: "Alopecia Areata", t: "s", r: "MeSH:D000506", d: "Autoimmune non-scarring hair loss.", g: 2, l: "r", x: 377, y: 307.6 },
  { id: "ra", n: "Rheumatoid Arthritis", t: "s", r: "MeSH:D001172", d: "Autoimmune inflammatory polyarthritis.", g: 11, l: "r", x: 447.7, y: 241.9 },
  { id: "covid19", n: "COVID-19", t: "s", r: "MeSH:D000086382", d: "SARS-CoV-2 infection; severe disease is immune-mediated.", g: 5, l: "l", x: 395.6, y: 252.9 },
  { id: "gout", n: "Gout", t: "s", r: "MeSH:D006073", d: "Monosodium urate crystal arthropathy.", g: 2, l: "r", x: 576.7, y: 305.9 },
  { id: "osteoporosis", n: "Osteoporosis", t: "s", r: "MeSH:D010024", d: "Reduced bone mass with increased fracture risk.", g: 2, l: "l", x: 165.9, y: 318.2 },
  { id: "parkinsons", n: "Parkinson Disease", t: "s", r: "MeSH:D010300", d: "Nigrostriatal dopaminergic degeneration.", g: 1, l: "l", x: 306.6, y: 84.7 },
  { id: "hemangioma", n: "Infantile Hemangioma", t: "s", r: "MeSH:D018324", d: "Benign vascular tumour of infancy.", g: 2, l: "t", x: 62.7, y: 31 },
  { id: "crc", n: "Colorectal Cancer", t: "s", r: "MeSH:D015179", d: "Adenocarcinoma of the colon or rectum.", g: 1, l: "r", x: 537.6, y: 187.1 },
  { id: "hypercholesterolemia", n: "Hypercholesterolaemia", t: "s", r: "MeSH:D006937", d: "Elevated circulating LDL cholesterol.", g: 3, l: "r", x: 751.4, y: 331.2 },
  { id: "aud", n: "Alcohol Use Disorder", t: "s", r: "MeSH:D000437", d: "Compulsive alcohol use with impaired control.", g: 2, l: "r", x: 695.7, y: 53.1 },
  { id: "depression", n: "Major Depressive Disorder", t: "s", r: "MeSH:D003865", d: "Persistent low mood with functional impairment.", g: 2, l: "r", x: 536.4, y: 26.4 },
  { id: "myopathy", n: "Myopathy", t: "e", r: "MeSH:D009135", d: "Muscle pain and weakness; rarely rhabdomyolysis.", g: 3, l: "t", x: 641.3, y: 301.9 },
  { id: "teratogenicity", n: "Teratogenicity", t: "e", r: "MeSH:D004610", d: "Structural malformation of the developing fetus.", g: 2, l: "l", x: 232.2, y: 192.7 },
  { id: "neuropathy", n: "Peripheral Neuropathy", t: "e", r: "MeSH:D010523", d: "Often dose-limiting and sometimes irreversible.", g: 1, l: "l", x: 206.8, y: 214.2 },
  { id: "hypertrichosis", n: "Hypertrichosis", t: "e", r: "MeSH:D006983", d: "Excess hair growth.", g: 1, l: "r", x: 212.8, y: 61.2 },
  { id: "gi_bleeding", n: "Gastrointestinal Bleeding", t: "e", r: "MeSH:D006471", d: "Mucosal erosion and haemorrhage.", g: 3, l: "r", x: 491, y: 158.6 },
  { id: "vte", n: "Venous Thromboembolism", t: "e", r: "MeSH:D054556", d: "Deep vein thrombosis or pulmonary embolism.", g: 4, l: "l", x: 266.3, y: 289.6 },
  { id: "immunosuppression", n: "Immunosuppression", t: "e", r: "MeSH:D007165", d: "Increased susceptibility to infection.", g: 3, l: null, x: 390.3, y: 227.7 },
  { id: "bradycardia", n: "Bradycardia", t: "e", r: "MeSH:D001919", d: "Abnormally slow heart rate.", g: 2, l: null, x: 54.6, y: 58.8 },
] as const;

const LINKS = [
  { s: 0, t: 18, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 0, t: 19, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 11, t: 19, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 1, t: 22, r: "activates", e: "a", f: "DrugBank" },
  { s: 2, t: 20, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 3, t: 21, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 4, t: 23, r: "targets", e: "a", f: "DrugBank" },
  { s: 5, t: 34, r: "activates", e: "a", f: "DrugBank" },
  { s: 6, t: 24, r: "targets", e: "a", f: "DrugBank" },
  { s: 7, t: 24, r: "targets", e: "a", f: "DrugBank" },
  { s: 8, t: 25, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 8, t: 26, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 9, t: 27, r: "targets", e: "a", f: "DrugBank" },
  { s: 10, t: 28, r: "targets", e: "a", f: "DrugBank" },
  { s: 12, t: 29, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 15, t: 30, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 16, t: 32, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 17, t: 33, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 14, t: 35, r: "inhibits", e: "a", f: "DrugBank" },
  { s: 1, t: 38, r: "treats", e: "a", f: "DrugBank" },
  { s: 2, t: 41, r: "treats", e: "a", f: "DrugBank" },
  { s: 2, t: 39, r: "treats", e: "a", f: "DrugBank" },
  { s: 3, t: 54, r: "treats", e: "a", f: "DrugBank" },
  { s: 4, t: 44, r: "treats", e: "a", f: "DrugBank" },
  { s: 5, t: 40, r: "treats", e: "a", f: "DrugBank" },
  { s: 5, t: 45, r: "treats", e: "a", f: "DrugBank" },
  { s: 6, t: 50, r: "treats", e: "a", f: "DrugBank" },
  { s: 7, t: 43, r: "treats", e: "a", f: "DrugBank" },
  { s: 8, t: 47, r: "treats", e: "a", f: "DrugBank" },
  { s: 8, t: 48, r: "treats", e: "a", f: "FDA" },
  { s: 8, t: 46, r: "treats", e: "a", f: "FDA" },
  { s: 9, t: 49, r: "treats", e: "a", f: "DrugBank" },
  { s: 10, t: 48, r: "treats", e: "a", f: "RECOVERY trial" },
  { s: 10, t: 47, r: "treats", e: "a", f: "DrugBank" },
  { s: 11, t: 47, r: "treats", e: "a", f: "DrugBank" },
  { s: 12, t: 40, r: "treats", e: "a", f: "DrugBank" },
  { s: 12, t: 52, r: "treats", e: "a", f: "DrugBank" },
  { s: 13, t: 51, r: "treats", e: "a", f: "DrugBank" },
  { s: 15, t: 42, r: "treats", e: "a", f: "DrugBank" },
  { s: 16, t: 40, r: "treats", e: "a", f: "DrugBank" },
  { s: 17, t: 55, r: "treats", e: "a", f: "DrugBank" },
  { s: 14, t: 56, r: "treats", e: "a", f: "DrugBank" },
  { s: 0, t: 47, r: "treats", e: "a", f: "DrugBank" },
  { s: 9, t: 47, r: "treats", e: "c", f: "Clinical literature" },
  { s: 19, t: 53, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 19, t: 47, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 18, t: 61, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 20, t: 39, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 20, t: 41, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 21, t: 54, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 21, t: 57, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 22, t: 38, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 22, t: 43, r: "associated_with", e: "p", f: "DisGeNET" },
  { s: 23, t: 44, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 23, t: 58, r: "associated_with", e: "p", f: "Literature" },
  { s: 24, t: 43, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 24, t: 50, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 25, t: 47, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 25, t: 46, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 26, t: 47, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 26, t: 48, r: "associated_with", e: "c", f: "Literature" },
  { s: 27, t: 49, r: "associated_with", e: "c", f: "Literature" },
  { s: 28, t: 47, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 28, t: 63, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 29, t: 40, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 29, t: 52, r: "associated_with", e: "p", f: "Literature" },
  { s: 29, t: 64, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 30, t: 42, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 31, t: 42, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 31, t: 54, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 32, t: 40, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 33, t: 55, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 34, t: 40, r: "associated_with", e: "p", f: "DisGeNET" },
  { s: 34, t: 45, r: "associated_with", e: "p", f: "Literature" },
  { s: 35, t: 56, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 36, t: 47, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 36, t: 48, r: "associated_with", e: "c", f: "Literature" },
  { s: 37, t: 48, r: "associated_with", e: "a", f: "Literature" },
  { s: 37, t: 47, r: "associated_with", e: "a", f: "DisGeNET" },
  { s: 37, t: 44, r: "associated_with", e: "c", f: "DisGeNET" },
  { s: 3, t: 57, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 0, t: 61, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 11, t: 61, r: "causes_side_effect", e: "c", f: "SIDER" },
  { s: 4, t: 58, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 4, t: 59, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 4, t: 62, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 5, t: 60, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 6, t: 62, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 7, t: 62, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 10, t: 63, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 8, t: 63, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 8, t: 62, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 12, t: 64, r: "causes_side_effect", e: "a", f: "SIDER" },
  { s: 9, t: 57, r: "causes_side_effect", e: "c", f: "SIDER" },
] as const;

/** Entity kinds, keyed by the first letter stored in each node's `t`. */
const KIND = {
  d: { label: "Drug", color: "var(--color-primary-ink)" },
  g: { label: "Gene / protein", color: "var(--color-success-ink)" },
  s: { label: "Disease", color: "var(--color-warning-ink)" },
  e: { label: "Side effect", color: "var(--color-destructive-ink)" },
} as const;

/** Evidence tiers, keyed by the first letter stored in each link's `e`. */
const TIER = {
  a: { label: "Approved", width: 1.5, opacity: 0.55, dash: undefined },
  c: { label: "Clinical", width: 1.3, opacity: 0.5, dash: "5 3" },
  p: { label: "Preclinical", width: 1.2, opacity: 0.45, dash: "2 3" },
} as const;

type Kind = keyof typeof KIND;
type Tier = keyof typeof TIER;

const radius = (deg: number) => 4.5 + Math.min(deg, 11) * 0.6;

export default function RepurposeGraph() {
  const [active, setActive] = useState<number | null>(null);

  /* Incident edges and neighbours for the selected node. Built once per
     selection rather than scanned inside the render of all 94 edges. */
  const focus = useMemo(() => {
    if (active === null) return null;
    const edges = new Set<number>();
    const near = new Set<number>([active]);
    LINKS.forEach((l, i) => {
      if (l.s === active || l.t === active) {
        edges.add(i);
        near.add(l.s === active ? l.t : l.s);
      }
    });
    return { edges, near, node: NODES[active], rows: [...edges].map((i) => LINKS[i]) };
  }, [active]);

  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-2xl border border-border bg-card elev-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border px-5 py-4 sm:px-7">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              The RepurposeAI knowledge graph
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              65 entities · 94 curated relations · DrugBank, DisGeNET, SIDER, FDA, RECOVERY
            </p>
          </div>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            {focus ? "Selected" : "Select a node"}
          </span>
        </div>

        {/*
          The graph keeps its own width on a narrow screen and pans, rather
          than being scaled until the labels are unreadable. A 1000-unit
          viewBox squeezed into 390px would put the type under 5px.
        */}
        <div className="overflow-x-auto overscroll-x-contain px-3 pt-4 sm:px-5">
          <svg
            viewBox="0 0 1000 460"
            className="h-auto w-full min-w-[720px]"
            role="img"
            aria-label="Node-link diagram of the RepurposeAI curated graph: 18 drugs, 20 genes, 19 diseases and 8 side effects, joined by 94 relations drawn from DrugBank, DisGeNET, SIDER, the FDA and the RECOVERY trial."
            onPointerLeave={() => setActive(null)}
          >
            <g>
              {LINKS.map((l, i) => {
                const a = NODES[l.s], b = NODES[l.t];
                // A slight perpendicular bow separates the two edges of a
                // reciprocal pair and keeps long chords off the discs.
                const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
                const dx = b.x - a.x, dy = b.y - a.y;
                const k = 0.075;
                const tier = TIER[l.e as Tier];
                const on = !focus || focus.edges.has(i);
                return (
                  <path
                    key={i}
                    d={`M${a.x} ${a.y} Q${mx - dy * k} ${my + dx * k} ${b.x} ${b.y}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={on && focus ? tier.width + 0.7 : tier.width}
                    strokeDasharray={tier.dash}
                    className="text-foreground transition-opacity duration-200"
                    style={{ opacity: on ? (focus ? 0.8 : tier.opacity * 0.55) : 0.07 }}
                  />
                );
              })}
            </g>

            <g>
              {NODES.map((n, i) => {
                const kind = KIND[n.t as Kind];
                const on = !focus || focus.near.has(i);
                const isActive = active === i;
                const r = radius(n.g);
                /*
                  The side was chosen at build time against every disc and
                  every other label; `null` means no slot was free, so that
                  name only appears when its node is selected. Those fall back
                  to whichever side points away from the selected node —
                  sending them all right put "Erectile Dysfunction" straight
                  through "Pulmonary Arterial Hypertension" the moment
                  Sildenafil was picked.
                */
                let side: string | null = n.l;
                if (side === null && focus) {
                  const dx = n.x - focus.node.x, dy = n.y - focus.node.y;
                  side = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? "r" : "l") : dy >= 0 ? "b" : "t";
                }
                const show = n.l !== null || (focus ? focus.near.has(i) : false);
                return (
                  <g
                    key={n.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`${n.n}. ${kind.label}. ${n.r}. ${n.d}`}
                    className="cursor-pointer outline-none transition-opacity duration-200 [&:focus-visible>circle:last-of-type]:stroke-[color:var(--color-ring)]"
                    style={{ opacity: on ? 1 : 0.18 }}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(isActive ? null : i)}
                  >
                    {isActive && (
                      <circle cx={n.x} cy={n.y} r={r + 6} fill={kind.color} opacity={0.18} />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r}
                      fill={kind.color}
                      stroke="var(--color-card)"
                      strokeWidth={1.5}
                    />
                    {show && (
                      <text
                        x={side === "l" ? n.x - r - 4 : side === "t" || side === "b" ? n.x : n.x + r + 4}
                        y={side === "t" ? n.y - r - 6 : side === "b" ? n.y + r + 12 : n.y + 3.6}
                        textAnchor={side === "l" ? "end" : side === "t" || side === "b" ? "middle" : "start"}
                        className="pointer-events-none fill-foreground"
                        style={{
                          fontSize: 10.5,
                          fontWeight: isActive ? 700 : 500,
                          paintOrder: "stroke",
                          stroke: "var(--card)",
                          strokeWidth: n.l === null ? 3.5 : 0,
                        }}
                      >
                        {n.n}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Legend, and the readout for whatever is selected. Reserving the
            height stops the panel appearing and disappearing under the
            cursor, which made the whole figure jump on every hover. */}
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3 border-t border-border px-5 py-4 sm:px-7">
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
            {(Object.keys(KIND) as Kind[]).map((k) => (
              <li key={k} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: KIND[k].color }}
                />
                {KIND[k].label}
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
            {(Object.keys(TIER) as Tier[]).map((k) => (
              <li key={k} className="flex items-center gap-2 text-xs text-muted-foreground">
                <svg width="20" height="6" aria-hidden="true" className="shrink-0">
                  <line
                    x1="0" y1="3" x2="20" y2="3"
                    stroke="currentColor"
                    strokeWidth={TIER[k].width}
                    strokeDasharray={TIER[k].dash}
                  />
                </svg>
                {TIER[k].label}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-h-[104px] border-t border-border bg-muted/20 px-5 py-4 sm:px-7">
          {focus ? (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-semibold">{focus.node.n}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ color: KIND[focus.node.t as Kind].color, background: "color-mix(in oklab, currentColor 8%, transparent)" }}
                >
                  {KIND[focus.node.t as Kind].label}
                </span>
                <code className="text-[11px] text-muted-foreground">{focus.node.r}</code>
              </div>
              <p className="mt-1.5 max-w-[80ch] text-sm text-muted-foreground">{focus.node.d}</p>
              <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                {focus.rows.map((l, i) => {
                  const other = NODES[l.s === active ? l.t : l.s];
                  return (
                    <li key={i} className="text-xs text-muted-foreground">
                      <span className="text-foreground">{l.r.replace(/_/g, " ")}</span> {other.n}
                      <span className="opacity-60"> · {l.f}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="max-w-[80ch] text-sm text-muted-foreground">
              Repurposing asks whether a drug already approved for one disease acts on a
              target implicated in another. That question is a path through this graph —
              Sildenafil through PDE5, Thalidomide through TNF, Baricitinib through JAK1.
              Point at any entity to see its relations and where each one was sourced.
            </p>
          )}
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Read from the RepurposeAI lab&rsquo;s own curated graph. The lab is explicit that
        this set is curated rather than exhaustive, and the evidence tier on every edge is
        the curators&rsquo; own.
      </figcaption>
    </figure>
  );
}
