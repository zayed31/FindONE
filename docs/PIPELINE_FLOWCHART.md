# Advanced Product Search Pipeline - Flowchart Documentation

## Pipeline Overview Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           QUERY INPUT                                        │
│                        "Samsung S25"                                        │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STAGE 1                                            │
│                    QUERY UNDERSTANDING                                      │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   Spell Check   │    │ Intent Analysis │    │Attribute Extract│        │
│  │                 │    │                 │    │                 │        │
│  │ "Samsung S25"   │───▶│ specific_model  │───▶│ brand: samsung  │        │
│  │                 │    │ confidence: 0.95│    │ model: s25      │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STAGE 2                                            │
│                ML-POWERED CLASSIFICATION                                    │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │ Zero-Shot Class │    │Feature-Based    │    │Ensemble         │        │
│  │                 │    │Classification   │    │Classification   │        │
│  │ mobile_phones   │    │ mobile_phones   │    │ mobile_phones   │        │
│  │ confidence: 0.4 │    │ confidence: 0.7 │    │ confidence: 0.68│        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STAGE 3                                            │
│              MULTI-SOURCE DATA RETRIEVAL                                    │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │ Primary Sources │    │Secondary Sources│    │Tertiary Sources │        │
│  │                 │    │                 │    │                 │        │
│  │ • Flipkart      │    │ • Paytm Mall    │    │ • PriceBaba     │        │
│  │ • Amazon India  │    │ • Tata CLiQ     │    │ • MySmartPrice  │        │
│  │ • Snapdeal      │    │ • Vijay Sales   │    │ • Gadgets360    │        │
│  │ • Croma         │    │                 │    │                 │        │
│  │ • Reliance      │    │                 │    │                 │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                       │                       │                │
│           ▼                       ▼                       ▼                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   40 Products Retrieved                             │   │
│  │              (8 per primary source)                                │   │
│  └─────────────────────┬───────────────────────────────────────────────┘   │
└────────────────────────┼───────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STAGE 4                                            │
│              SEMANTIC MATCHING & RANKING                                   │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   Lexical BM25  │    │  Semantic Match │    │Attribute Match  │        │
│  │                 │    │                 │    │                 │        │
│  │ Score: 0.85     │    │ Score: 0.92     │    │ Score: 0.78     │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                       │                       │                │
│           └───────────────────────┼───────────────────────┘                │
│                                   ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              Weighted Relevance Score: 0.82                        │   │
│  └─────────────────────┬───────────────────────────────────────────────┘   │
└────────────────────────┼───────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STAGE 5                                            │
│              ADVANCED FILTERING & RE-RANKING                               │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │Category Filter  │    │Brand-Model      │    │Specification    │        │
│  │                 │    │Filter           │    │Filter           │        │
│  │ mobile_phones   │    │ samsung + s25   │    │ 5G, RAM, etc.   │        │
│  │ ✅ PASS         │    │ ✅ PASS         │    │ ✅ PASS         │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                       │                       │                │
│           └───────────────────────┼───────────────────────┘                │
│                                   ▼                                        │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   RRF Scoring   │    │Business Rules   │    │Final Ranking    │        │
│  │                 │    │                 │    │                 │        │
│  │ RRF: 0.016      │    │ Business: 0.75  │    │ Final: 0.45     │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FINAL RESULTS                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Samsung Galaxy S25 128GB Phantom Black - ₹89,999               │   │
│  │ 2. Samsung Galaxy S25 256GB Awesome Navy - ₹99,999                │   │
│  │ 3. Samsung Galaxy S25+ 128GB Light Blue - ₹109,999                │   │
│  │ 4. Samsung Galaxy S25 Ultra 256GB Phantom Black - ₹129,999        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Decision Points & Fallback Mechanisms

### Stage 1 Decision Points
```
Query Input
    │
    ▼
┌─────────────────┐
│ Spell Check     │
│                 │
│ "Samsung S25"   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Intent Analysis │
│                 │
│ specific_model  │
│ confidence: 0.95│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Attribute Extract│
│                 │
│ brand: samsung  │
│ model: s25      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Confidence > 0.7│
│                 │
│ ✅ YES → Continue│
│ ❌ NO → Fallback │
└─────────────────┘
```

### Stage 2 Decision Points
```
ML Classification
    │
    ▼
┌─────────────────┐
│ Zero-Shot       │
│ Classification  │
│                 │
│ mobile_phones   │
│ confidence: 0.4 │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Feature-Based   │
│ Classification  │
│                 │
│ mobile_phones   │
│ confidence: 0.7 │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Ensemble        │
│ Classification  │
│                 │
│ mobile_phones   │
│ confidence: 0.68│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Confidence > 0.5│
│                 │
│ ✅ YES → Continue│
│ ❌ NO → Default  │
│     Category     │
└─────────────────┘
```

### Stage 3 Decision Points
```
Multi-Source Retrieval
    │
    ▼
┌─────────────────┐
│ Primary Sources │
│                 │
│ Flipkart, Amazon│
│ India, Snapdeal │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Products >= 10? │
│                 │
│ ✅ YES → Skip   │
│ ❌ NO → Continue│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Secondary       │
│ Sources         │
│                 │
│ Paytm Mall,     │
│ Tata CLiQ       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Products >= 20? │
│                 │
│ ✅ YES → Skip   │
│ ❌ NO → Continue│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Tertiary        │
│ Sources         │
│                 │
│ PriceBaba,      │
│ MySmartPrice    │
└─────────────────┘
```

### Stage 4 Decision Points
```
Semantic Matching
    │
    ▼
┌─────────────────┐
│ Lexical BM25    │
│ Scoring         │
│                 │
│ Score: 0.85     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Semantic        │
│ Matching        │
│                 │
│ Score: 0.92     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Attribute       │
│ Matching        │
│                 │
│ Score: 0.78     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Weighted        │
│ Relevance       │
│                 │
│ Score: 0.82     │
└─────────────────┘
```

### Stage 5 Decision Points
```
Advanced Filtering
    │
    ▼
┌─────────────────┐
│ Category Filter │
│                 │
│ mobile_phones   │
│ ✅ PASS         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Brand-Model     │
│ Filter          │
│                 │
│ samsung + s25   │
│ ✅ PASS         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Specification   │
│ Filter          │
│                 │
│ 5G, RAM, etc.   │
│ ✅ PASS         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Geographic      │
│ Filter          │
│                 │
│ Indian Retailers│
│ ✅ PASS         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ RRF Scoring     │
│                 │
│ RRF: 0.016      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Business Rules  │
│                 │
│ Business: 0.75  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Final Ranking   │
│                 │
│ Final: 0.45     │
└─────────────────┘
```

## Error Handling Flowchart

```
Error Handling & Fallbacks
    │
    ▼
┌─────────────────┐
│ Stage 1 Error   │
│                 │
│ NLP Processing  │
│ Failed          │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Basic Keyword   │
│ Extraction      │
│                 │
│ Fallback        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Stage 2 Error   │
│                 │
│ ML Classification│
│ Failed          │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Default Category│
│ Assignment      │
│                 │
│ Fallback        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Stage 3 Error   │
│                 │
│ API Failures    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Legacy Retrieval│
│                 │
│ Fallback        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Stage 4 Error   │
│                 │
│ Semantic Match  │
│ Failed          │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Basic Lexical   │
│ Scoring         │
│                 │
│ Fallback        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Stage 5 Error   │
│                 │
│ Filtering Failed│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Return Original │
│ Products        │
│                 │
│ Fallback        │
└─────────────────┘
```

## Performance Monitoring Points

```
Performance Monitoring
    │
    ▼
┌─────────────────┐
│ Stage 1 Timer   │
│                 │
│ Query Understanding│
│ Time: 50ms      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Stage 2 Timer   │
│                 │
│ ML Classification│
│ Time: 100ms     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Stage 3 Timer   │
│                 │
│ Multi-Source    │
│ Time: 2000ms    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Stage 4 Timer   │
│                 │
│ Semantic Match  │
│ Time: 150ms     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Stage 5 Timer   │
│                 │
│ Advanced Filter │
│ Time: 25ms      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Total Time      │
│                 │
│ 2325ms          │
└─────────────────┘
```

## Data Flow Diagram

```
Data Flow Through Pipeline
    │
    ▼
┌─────────────────┐
│ Input Query     │
│ "Samsung S25"   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Processed Query │
│ {               │
│   brand: 'samsung',│
│   model: 's25', │
│   intent: 'specific_model'│
│ }               │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ML Classification│
│ {               │
│   primary: {    │
│     category: 'mobile_phones',│
│     confidence: 0.68│
│   }             │
│ }               │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Retrieved Products│
│ [                │
│   {             │
│     title: 'Samsung Galaxy S25',│
│     price: '₹89,999',│
│     source: 'Flipkart'│
│   },            │
│   ...           │
│ ]               │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Semantic Scores │
│ [                │
│   {             │
│     title: 'Samsung Galaxy S25',│
│     semanticScores: {│
│       lexical: 0.85,│
│       semantic: 0.92,│
│       relevance: 0.82│
│     }           │
│   },            │
│   ...           │
│ ]               │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Final Results   │
│ [                │
│   {             │
│     title: 'Samsung Galaxy S25',│
│     price: '₹89,999',│
│     finalScore: 0.45,│
│     rank: 1     │
│   },            │
│   ...           │
│ ]               │
└─────────────────┘
```

This flowchart documentation provides a comprehensive visual representation of how data flows through the 5-stage pipeline, including decision points, fallback mechanisms, and performance monitoring points. 