"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/*
  The RepurposeAI teaching graph, in three dimensions.

  Same source as before — `repurposeai-api/app/data/curated_graph.json`, the
  file the lab itself queries — but laid out in 3D and drawn to a canvas that
  turns. 65 entities, 94 relations, and the seven sources named in the
  caption are what that file contains; nothing is added to fill the picture.

  Why 3D genuinely helps here rather than being decoration: this graph has
  six disconnected components. Flat, they had to be packed around each other
  and the giant one still crowded; in 3D they separate along an axis the
  page did not have, and the drug/gene/disease chains that make a
  repurposing argument stop crossing each other.

  Positions are baked, from a seeded spring-electrical pass followed by a
  collision-relaxation pass in final scale. Solving it on mount would cost a
  frame budget and settle somewhere slightly different on every visit, so
  two people would not be describing the same picture.

      node scratch/layout3d.cjs

  Canvas, not SVG: 65 spheres and 94 edges re-projected every frame is 160
  elements whose transform changes 60 times a second, and the DOM is the
  wrong place for that.
*/

  // 65 entities, 94 relations, laid out in 3D
  // kinds {"d": 18, "g": 20, "s": 19, "e": 8} · evidence {"a": 70, "c": 19, "p": 5}
const NODES = [
  { id: "aspirin", n: "Aspirin", t: "d", r: "DB00945", d: "Irreversible COX inhibitor; antiplatelet at low dose.", g: 4, x: 28.7, y: 9.2, z: -29.3 },
  { id: "metformin", n: "Metformin", t: "d", r: "DB00331", d: "First-line biguanide for type 2 diabetes.", g: 2, x: -28.4, y: 64.4, z: -4.9 },
  { id: "sildenafil", n: "Sildenafil", t: "d", r: "DB00203", d: "PDE5 inhibitor; developed for angina, repurposed twice.", g: 3, x: -1.7, y: 54.5, z: 82.5 },
  { id: "atorvastatin", n: "Atorvastatin", t: "d", r: "DB01076", d: "HMG-CoA reductase inhibitor.", g: 3, x: -8.8, y: -21.3, z: -45.2 },
  { id: "thalidomide", n: "Thalidomide", t: "d", r: "DB01041", d: "Cereblon modulator; withdrawn for teratogenicity, later repurposed.", g: 5, x: 13.5, y: 43.8, z: -19.9 },
  { id: "minoxidil", n: "Minoxidil", t: "d", r: "DB00350", d: "ATP-sensitive potassium channel opener.", g: 4, x: -20, y: -46.6, z: 65.9 },
  { id: "raloxifene", n: "Raloxifene", t: "d", r: "DB00481", d: "Selective estrogen receptor modulator.", g: 3, x: 2, y: 44, z: -10.4 },
  { id: "tamoxifen", n: "Tamoxifen", t: "d", r: "DB00675", d: "Selective estrogen receptor modulator.", g: 3, x: -5.8, y: 46.5, z: -17.6 },
  { id: "baricitinib", n: "Baricitinib", t: "d", r: "DB11817", d: "JAK1/JAK2 inhibitor with three separate approvals.", g: 7, x: 9.6, y: 26.8, z: -22.7 },
  { id: "colchicine", n: "Colchicine", t: "d", r: "DB01394", d: "Tubulin-binding anti-inflammatory.", g: 4, x: 8.1, y: -1.1, z: -37.6 },
  { id: "dexamethasone", n: "Dexamethasone", t: "d", r: "DB01234", d: "Long-acting glucocorticoid.", g: 4, x: 21.2, y: 16, z: -20 },
  { id: "celecoxib", n: "Celecoxib", t: "d", r: "DB00482", d: "Selective COX-2 inhibitor.", g: 3, x: 19.5, y: 0.4, z: -32.5 },
  { id: "propranolol", n: "Propranolol", t: "d", r: "DB00571", d: "Non-selective beta blocker.", g: 4, x: -39.9, y: -45.3, z: 69.4 },
  { id: "amantadine", n: "Amantadine", t: "d", r: "DB00915", d: "Influenza A antiviral, repurposed for Parkinson disease.", g: 1, x: -100, y: -5, z: -0.9 },
  { id: "bupropion", n: "Bupropion", t: "d", r: "DB01156", d: "Norepinephrine-dopamine reuptake inhibitor.", g: 2, x: 25.2, y: -96.9, z: 0 },
  { id: "donepezil", n: "Donepezil", t: "d", r: "DB00843", d: "Reversible acetylcholinesterase inhibitor.", g: 2, x: -28.1, y: -48.1, z: -56.9 },
  { id: "losartan", n: "Losartan", t: "d", r: "DB00678", d: "Angiotensin II receptor blocker.", g: 2, x: -27.1, y: -49.9, z: 57.2 },
  { id: "naltrexone", n: "Naltrexone", t: "d", r: "DB00704", d: "Opioid receptor antagonist.", g: 2, x: 84.6, y: -15.3, z: 49 },
  { id: "PTGS1", n: "PTGS1 (COX-1)", t: "g", r: "HGNC:9604", d: "Constitutive cyclooxygenase; gastric mucosal protection.", g: 2, x: 37, y: 1.4, z: -30.2 },
  { id: "PTGS2", n: "PTGS2 (COX-2)", t: "g", r: "HGNC:9605", d: "Inducible cyclooxygenase; inflammation and tumour biology.", g: 4, x: 24.2, y: 9.5, z: -39 },
  { id: "PDE5A", n: "PDE5A", t: "g", r: "HGNC:8784", d: "cGMP-specific phosphodiesterase; vascular smooth muscle.", g: 3, x: -3.6, y: 41.8, z: 87.8 },
  { id: "HMGCR", n: "HMGCR", t: "g", r: "HGNC:5006", d: "Rate-limiting enzyme of cholesterol biosynthesis.", g: 3, x: -1.2, y: -24.2, z: -50 },
  { id: "PRKAA1", n: "PRKAA1 (AMPK α1)", t: "g", r: "HGNC:9376", d: "Catalytic subunit of the cellular energy sensor AMPK.", g: 3, x: -19.3, y: 60.7, z: -5.1 },
  { id: "CRBN", n: "CRBN (Cereblon)", t: "g", r: "HGNC:30185", d: "Substrate receptor of a CUL4 E3 ubiquitin ligase.", g: 3, x: 24.4, y: 43.3, z: -25.6 },
  { id: "ESR1", n: "ESR1", t: "g", r: "HGNC:3467", d: "Estrogen receptor alpha.", g: 4, x: -5.9, y: 50.4, z: -8.7 },
  { id: "JAK1", n: "JAK1", t: "g", r: "HGNC:6190", d: "Janus kinase; cytokine receptor signalling.", g: 3, x: 4.4, y: 13.8, z: -27.9 },
  { id: "JAK2", n: "JAK2", t: "g", r: "HGNC:6192", d: "Janus kinase; haematopoietic cytokine signalling.", g: 3, x: 7.6, y: 22.1, z: -32.8 },
  { id: "TUBB", n: "TUBB", t: "g", r: "HGNC:20778", d: "Beta-tubulin; microtubule assembly.", g: 2, x: 3.6, y: -5.1, z: -47 },
  { id: "NR3C1", n: "NR3C1", t: "g", r: "HGNC:7978", d: "Glucocorticoid receptor.", g: 3, x: 12.9, y: 7.8, z: -22.8 },
  { id: "ADRB2", n: "ADRB2", t: "g", r: "HGNC:286", d: "Beta-2 adrenergic receptor.", g: 4, x: -34.8, y: -37.9, z: 57.9 },
  { id: "ACHE", n: "ACHE", t: "g", r: "HGNC:108", d: "Acetylcholinesterase.", g: 2, x: -19.8, y: -53.2, z: -58.9 },
  { id: "APOE", n: "APOE", t: "g", r: "HGNC:613", d: "Apolipoprotein E; ε4 allele is the major late-onset AD risk factor.", g: 2, x: -14.6, y: -37.3, z: -53.2 },
  { id: "AGTR1", n: "AGTR1", t: "g", r: "HGNC:336", d: "Angiotensin II receptor type 1.", g: 2, x: -30.8, y: -54.3, z: 66.7 },
  { id: "OPRM1", n: "OPRM1", t: "g", r: "HGNC:8156", d: "Mu-opioid receptor.", g: 2, x: 79.6, y: -24.6, z: 51.9 },
  { id: "KCNJ8", n: "KCNJ8", t: "g", r: "HGNC:6269", d: "Inward-rectifier K+ channel subunit of the K-ATP channel.", g: 3, x: -28, y: -38.9, z: 73.5 },
  { id: "SLC6A2", n: "SLC6A2 (NET)", t: "g", r: "HGNC:11048", d: "Norepinephrine transporter.", g: 2, x: 20, y: -96.6, z: 9.7 },
  { id: "TNF", n: "TNF", t: "g", r: "HGNC:11892", d: "Tumour necrosis factor; pro-inflammatory cytokine.", g: 2, x: 22.1, y: 18.5, z: -36.5 },
  { id: "IL6", n: "IL6", t: "g", r: "HGNC:6018", d: "Interleukin 6; drives the acute phase response.", g: 3, x: 20.5, y: 28.4, z: -29.5 },
  { id: "t2dm", n: "Type 2 Diabetes", t: "s", r: "MeSH:D003924", d: "Insulin resistance with relative insulin deficiency.", g: 2, x: -21.4, y: 67.7, z: 0.4 },
  { id: "pah", n: "Pulmonary Arterial Hypertension", t: "s", r: "MeSH:D000081029", d: "Elevated pressure in the pulmonary arteries. Distinct from essential hypertension.", g: 2, x: -9.1, y: 48.5, z: 84.8 },
  { id: "hypertension", n: "Essential Hypertension", t: "s", r: "MeSH:D000075222", d: "Chronically raised systemic arterial pressure.", g: 6, x: -30.3, y: -44.4, z: 65 },
  { id: "ed", n: "Erectile Dysfunction", t: "s", r: "MeSH:D007172", d: "Impaired penile erection, frequently vascular in origin.", g: 2, x: 3.4, y: 47.5, z: 85.7 },
  { id: "alzheimers", n: "Alzheimer Disease", t: "s", r: "MeSH:D000544", d: "Progressive neurodegeneration with amyloid and tau pathology.", g: 3, x: -19.6, y: -44.6, z: -55.8 },
  { id: "breast_cancer", n: "Breast Cancer", t: "s", r: "MeSH:D001943", d: "Most cases are hormone receptor positive.", g: 3, x: -14.2, y: 55.1, z: -10.8 },
  { id: "myeloma", n: "Multiple Myeloma", t: "s", r: "MeSH:D009101", d: "Malignancy of plasma cells.", g: 3, x: 18.1, y: 36.2, z: -24.7 },
  { id: "aga", n: "Androgenetic Alopecia", t: "s", r: "MeSH:D000505", d: "Patterned hair loss driven by androgens.", g: 2, x: -18.9, y: -39.7, z: 74.2 },
  { id: "alopecia_areata", n: "Alopecia Areata", t: "s", r: "MeSH:D000506", d: "Autoimmune non-scarring hair loss.", g: 2, x: 1.2, y: 22.2, z: -26.2 },
  { id: "ra", n: "Rheumatoid Arthritis", t: "s", r: "MeSH:D001172", d: "Autoimmune inflammatory polyarthritis.", g: 11, x: 12.8, y: 9.7, z: -35.1 },
  { id: "covid19", n: "COVID-19", t: "s", r: "MeSH:D000086382", d: "SARS-CoV-2 infection; severe disease is immune-mediated.", g: 5, x: 16.2, y: 19.4, z: -28.3 },
  { id: "gout", n: "Gout", t: "s", r: "MeSH:D006073", d: "Monosodium urate crystal arthropathy.", g: 2, x: 8.6, y: -10.1, z: -41.6 },
  { id: "osteoporosis", n: "Osteoporosis", t: "s", r: "MeSH:D010024", d: "Reduced bone mass with increased fracture risk.", g: 2, x: 0.5, y: 48.9, z: -1.8 },
  { id: "parkinsons", n: "Parkinson Disease", t: "s", r: "MeSH:D010300", d: "Nigrostriatal dopaminergic degeneration.", g: 1, x: -99.8, y: 0.9, z: 4.9 },
  { id: "hemangioma", n: "Infantile Hemangioma", t: "s", r: "MeSH:D018324", d: "Benign vascular tumour of infancy.", g: 2, x: -43.4, y: -43.5, z: 59.5 },
  { id: "crc", n: "Colorectal Cancer", t: "s", r: "MeSH:D015179", d: "Adenocarcinoma of the colon or rectum.", g: 1, x: 31.3, y: 6.6, z: -44 },
  { id: "hypercholesterolemia", n: "Hypercholesterolaemia", t: "s", r: "MeSH:D006937", d: "Elevated circulating LDL cholesterol.", g: 3, x: -9.4, y: -29.5, z: -50.3 },
  { id: "aud", n: "Alcohol Use Disorder", t: "s", r: "MeSH:D000437", d: "Compulsive alcohol use with impaired control.", g: 2, x: 78.8, y: -16.8, z: 56 },
  { id: "depression", n: "Major Depressive Disorder", t: "s", r: "MeSH:D003865", d: "Persistent low mood with functional impairment.", g: 2, x: 16.3, y: -98.4, z: 1.8 },
  { id: "myopathy", n: "Myopathy", t: "e", r: "MeSH:D009135", d: "Muscle pain and weakness; rarely rhabdomyolysis.", g: 3, x: 0, y: -14.7, z: -44.2 },
  { id: "teratogenicity", n: "Teratogenicity", t: "e", r: "MeSH:D004610", d: "Structural malformation of the developing fetus.", g: 2, x: 21, y: 51.6, z: -23.5 },
  { id: "neuropathy", n: "Peripheral Neuropathy", t: "e", r: "MeSH:D010523", d: "Often dose-limiting and sometimes irreversible.", g: 1, x: 16.8, y: 52, z: -16 },
  { id: "hypertrichosis", n: "Hypertrichosis", t: "e", r: "MeSH:D006983", d: "Excess hair growth.", g: 1, x: -12.2, y: -44.6, z: 70.5 },
  { id: "gi_bleeding", n: "Gastrointestinal Bleeding", t: "e", r: "MeSH:D006471", d: "Mucosal erosion and haemorrhage.", g: 3, x: 28.8, y: -0.7, z: -33.7 },
  { id: "vte", n: "Venous Thromboembolism", t: "e", r: "MeSH:D054556", d: "Deep vein thrombosis or pulmonary embolism.", g: 4, x: 4.9, y: 38.5, z: -18.1 },
  { id: "immunosuppression", n: "Immunosuppression", t: "e", r: "MeSH:D007165", d: "Increased susceptibility to infection.", g: 3, x: 10.3, y: 16.6, z: -20.2 },
  { id: "bradycardia", n: "Bradycardia", t: "e", r: "MeSH:D001919", d: "Abnormally slow heart rate.", g: 2, x: -41.5, y: -36.7, z: 65 },
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

/** Entity kinds, keyed by the letter in each node's `t`. */
const KIND = {
  d: { label: "Drug", css: "--color-primary-ink" },
  g: { label: "Gene / protein", css: "--color-success-ink" },
  s: { label: "Disease", css: "--color-warning-ink" },
  e: { label: "Side effect", css: "--color-destructive-ink" },
} as const;

/** Evidence tiers, keyed by the letter in each link's `e`. */
const TIER = {
  a: { label: "Approved", dash: [] as number[] },
  c: { label: "Clinical", dash: [5, 4] },
  p: { label: "Preclinical", dash: [1.5, 3.5] },
} as const;

type Kind = keyof typeof KIND;
type Tier = keyof typeof TIER;

const radius = (deg: number) => 2.2 + Math.min(deg, 11) * 0.28;

export default function RepurposeGraph3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hover;

  const focus = useMemo(() => {
    if (hover === null) return null;
    const near = new Set<number>([hover]);
    const rows: typeof LINKS[number][] = [];
    LINKS.forEach((l) => {
      if (l.s === hover || l.t === hover) {
        rows.push(l);
        near.add(l.s === hover ? l.t : l.s);
      }
    });
    return { near, rows, node: NODES[hover] };
  }, [hover]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Colours come from the stylesheet, not from literals, so the figure
       follows the theme and the tokens stay the single source of truth. */
    const css = getComputedStyle(document.documentElement);
    const colour: Record<string, string> = {};
    (Object.keys(KIND) as Kind[]).forEach((k) => {
      colour[k] = css.getPropertyValue(KIND[k].css).trim() || "#888";
    });
    const inkOf = (el: HTMLElement) => getComputedStyle(el).color;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let yaw = 0.5, pitch = -0.25, scale = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const drag = { on: false, x: 0, y: 0 };
    const projected: { i: number; sx: number; sy: number; sr: number; depth: number }[] = [];

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale));
      h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
    };

    const draw = () => {
      const fg = inkOf(wrap);
      ctx.clearRect(0, 0, w, h);
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const R = 100, dist = R * 3.1;
      const s = (Math.min(w, h) * 0.52) / R;
      const ox = w / 2, oy = h / 2;

      projected.length = 0;
      for (let i = 0; i < NODES.length; i++) {
        const n = NODES[i];
        const x1 = n.x * cy + n.z * sy, z1 = -n.x * sy + n.z * cy;
        const y2 = n.y * cp - z1 * sp, z2 = n.y * sp + z1 * cp;
        const k = dist / (dist + z2);
        projected.push({
          i, sx: ox + x1 * s * k, sy: oy - y2 * s * k,
          sr: radius(n.g) * s * k, depth: z2,
        });
      }

      const f = hoverRef.current;
      const near = f === null ? null : new Set<number>([f, ...LINKS.filter((l) => l.s === f || l.t === f).map((l) => (l.s === f ? l.t : l.s))]);

      // edges first, back to front
      const order = LINKS.map((l, i) => ({ l, i, d: (projected[l.s].depth + projected[l.t].depth) / 2 }))
        .sort((a, b) => b.d - a.d);
      for (const { l } of order) {
        const a = projected[l.s], b = projected[l.t];
        const lit = f === null || l.s === f || l.t === f;
        ctx.save();
        ctx.setLineDash(TIER[l.e as Tier].dash.map((v) => v * scale));
        ctx.strokeStyle = fg;
        ctx.globalAlpha = lit ? (f === null ? 0.5 : 0.9) : 0.06;
        ctx.lineWidth = (lit && f !== null ? 2.0 : 1.3) * scale;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
        ctx.restore();
      }

      // then nodes, back to front, so a near sphere covers a far one
      for (const p of [...projected].sort((a, b) => b.depth - a.depth)) {
        const n = NODES[p.i];
        const on = !near || near.has(p.i);
        ctx.save();
        ctx.globalAlpha = on ? 1 : 0.16;
        /* Depth read as a lighter fill: a sphere at the back is further into
           the page, which a flat disc cannot say on its own. */
        const fade = 1 - 0.45 * ((p.depth + 100) / 200);
        ctx.globalAlpha *= Math.max(0.35, fade);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, Math.max(1.5, p.sr), 0, Math.PI * 2);
        ctx.fillStyle = colour[n.t];
        ctx.fill();
        ctx.lineWidth = 1.2 * scale;
        ctx.strokeStyle = fg;
        ctx.globalAlpha *= 0.25;
        ctx.stroke();
        ctx.restore();

        // name the hubs, and whatever is being pointed at
        if (on && (n.g >= 5 || p.i === f)) {
          ctx.save();
          ctx.globalAlpha = p.i === f ? 1 : 0.85;
          ctx.fillStyle = fg;
          ctx.font = `${(p.i === f ? 700 : 500)} ${11 * scale}px ui-sans-serif, system-ui, sans-serif`;
          ctx.textBaseline = "middle";
          ctx.fillText(n.n, p.sx + p.sr + 5 * scale, p.sy);
          ctx.restore();
        }
      }
    };

    let raf = 0, running = false, last = 0;
    const frame = (now: number) => {
      if (!running) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (!drag.on && hoverRef.current === null) yaw += dt * 0.16;  // one turn in ~39s
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (running || reduced.matches) return; running = true; last = 0; raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(wrap);
    resize(); draw();

    let inView = false;
    const sync = () => (inView && !document.hidden && !reduced.matches ? start() : stop());
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.05 });
    io.observe(wrap);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);

    /* Hit testing against the projection rather than the model: the nearest
       projected centre within its own radius is what the pointer is over. */
    const pick = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const px = (e.clientX - r.left) * scale, py = (e.clientY - r.top) * scale;
      let best: number | null = null, bestD = Infinity;
      for (const p of projected) {
        const d = Math.hypot(p.sx - px, p.sy - py);
        if (d < Math.max(p.sr + 4 * scale, 9 * scale) && d < bestD) { bestD = d; best = p.i; }
      }
      return best;
    };

    const move = (e: PointerEvent) => {
      if (drag.on) {
        yaw += (e.clientX - drag.x) * 0.007;
        pitch = Math.max(-1.3, Math.min(1.3, pitch + (e.clientY - drag.y) * 0.006));
        drag.x = e.clientX; drag.y = e.clientY;
        draw();
        return;
      }
      const hit = pick(e);
      if (hit !== hoverRef.current) { hoverRef.current = hit; setHover(hit); draw(); }
      canvas.style.cursor = hit === null ? "grab" : "pointer";
    };
    const down = (e: PointerEvent) => { drag.on = true; drag.x = e.clientX; drag.y = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; };
    const up = (e: PointerEvent) => { drag.on = false; if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); canvas.style.cursor = "grab"; };
    const leave = () => { hoverRef.current = null; setHover(null); draw(); };

    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);

    return () => {
      stop(); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-2xl border border-border bg-card elev-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border px-5 py-4 sm:px-7">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">The RepurposeAI knowledge graph</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              65 entities · 94 curated relations · DrugBank, DisGeNET, SIDER, FDA, RECOVERY
            </p>
          </div>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            {focus ? "Selected" : "Drag to turn"}
          </span>
        </div>

        <div ref={wrapRef} className="relative aspect-[16/10] w-full">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="A rotating three-dimensional node-link diagram of the RepurposeAI curated graph: 18 drugs, 20 genes, 19 diseases and 8 side effects, joined by 94 relations drawn from DrugBank, DisGeNET, SIDER, the FDA and the RECOVERY trial."
            className="h-full w-full touch-none select-none"
          />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3 border-t border-border px-5 py-4 sm:px-7">
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
            {(Object.keys(KIND) as Kind[]).map((k) => (
              <li key={k} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `var(${KIND[k].css})` }} />
                {KIND[k].label}
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
            {(Object.keys(TIER) as Tier[]).map((k) => (
              <li key={k} className="flex items-center gap-2 text-xs text-muted-foreground">
                <svg width="20" height="6" aria-hidden="true" className="shrink-0">
                  <line x1="0" y1="3" x2="20" y2="3" stroke="currentColor" strokeWidth={1.3}
                    strokeDasharray={TIER[k].dash.join(" ") || undefined} />
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
                <span className="text-[11px] font-medium" style={{ color: `var(${KIND[focus.node.t as Kind].css})` }}>
                  {KIND[focus.node.t as Kind].label}
                </span>
                <code className="text-[11px] text-muted-foreground">{focus.node.r}</code>
              </div>
              <p className="mt-1.5 max-w-[80ch] text-sm text-muted-foreground">{focus.node.d}</p>
              <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                {focus.rows.map((l, i) => {
                  const other = NODES[l.s === hover ? l.t : l.s];
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
              Repurposing asks whether a drug already approved for one disease acts on a target
              implicated in another. That question is a path through this graph — Sildenafil
              through PDE5, Thalidomide through TNF, Baricitinib through JAK1. Point at any
              entity to see its relations and where each one was sourced.
            </p>
          )}
        </div>
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Figure 2.</span>{" "}
        Read from the RepurposeAI lab&rsquo;s own curated graph. The lab is explicit that this set
        is curated rather than exhaustive, and the evidence tier on every edge is the
        curators&rsquo; own.
      </figcaption>
    </figure>
  );
}
