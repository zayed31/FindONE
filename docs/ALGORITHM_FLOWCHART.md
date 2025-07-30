# AI-Powered Product Search Algorithm Flowchart

## Overview Flow

```mermaid
graph TD
    A[User Search Query] --> B[Query Understanding Layer]
    B --> C[Multi-Source Retrieval Layer]
    C --> D[E-commerce Filter Layer]
    D --> E[Relevance Ranking Engine]
    E --> F[Result Packaging]
    F --> G[Return Results to User]
    
    style A fill:#e1f5fe
    style G fill:#c8e6c9
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e8
    style E fill:#fff8e1
    style F fill:#fce4ec
```

## Detailed Algorithm Flow

```mermaid
flowchart TD
    Start([User enters search query]) --> InputValidation{Query valid?}
    InputValidation -->|No| ClearCache[Clear previous results]
    InputValidation -->|Yes| QueryPreprocess[Query Understanding Layer]
    
    ClearCache --> ReturnEmpty[Return empty results]
    
    QueryPreprocess --> ProcessQuery[Process & enhance query]
    ProcessQuery --> CheckCache{Cache hit?}
    
    CheckCache -->|Yes| ReturnCached[Return cached results]
    CheckCache -->|No| StartRetrieval[Start Multi-Source Retrieval]
    
    StartRetrieval --> API1[Google Shopping API]
    API1 --> API1Success{Success?}
    API1Success -->|Yes| CollectResults1[Collect results]
    API1Success -->|No| API2[Google Custom Search - Shopping]
    
    CollectResults1 --> CheckMinResults1{Enough results?}
    CheckMinResults1 -->|Yes| ProceedToFilter[Proceed to filtering]
    CheckMinResults1 -->|No| API2
    
    API2 --> API2Success{Success?}
    API2Success -->|Yes| CollectResults2[Collect results]
    API2Success -->|No| API3[Google Custom Search - General]
    
    CollectResults2 --> CheckMinResults2{Enough results?}
    CheckMinResults2 -->|Yes| ProceedToFilter
    CheckMinResults2 -->|No| API3
    
    API3 --> API3Success{Success?}
    API3Success -->|Yes| CollectResults3[Collect results]
    API3Success -->|No| API4[Google Custom Search - Indian]
    
    CollectResults3 --> CheckMinResults3{Enough results?}
    CheckMinResults3 -->|Yes| ProceedToFilter
    CheckMinResults3 -->|No| API4
    
    API4 --> API4Success{Success?}
    API4Success -->|Yes| CollectResults4[Collect results]
    API4Success -->|No| WebScrape[Web Scraping Fallback]
    
    CollectResults4 --> CheckMinResults4{Enough results?}
    CheckMinResults4 -->|Yes| ProceedToFilter
    CheckMinResults4 -->|No| WebScrape
    
    WebScrape --> CollectResults5[Collect results]
    CollectResults5 --> ProceedToFilter
    
    ProceedToFilter --> EcommerceFilter[E-commerce Filter Layer]
    EcommerceFilter --> DomainFilter[Domain whitelisting]
    DomainFilter --> ContentFilter[Content analysis]
    ContentFilter --> StructuredData[Structured data check]
    StructuredData --> Deduplication[GTIN deduplication]
    Deduplication --> Ranking[Relevance Ranking Engine]
    
    Ranking --> LexicalScore[Calculate Lexical Score]
    LexicalScore --> SemanticScore[Calculate Semantic Score]
    SemanticScore --> BusinessScore[Calculate Business Score]
    BusinessScore --> BehavioralScore[Calculate Behavioral Score]
    BehavioralScore --> TotalScore[Calculate Total Score]
    TotalScore --> SortResults[Sort by relevance]
    
    SortResults --> PackageResults[Result Packaging]
    PackageResults --> CacheResults[Cache results]
    CacheResults --> ReturnResults[Return results to user]
    
    ReturnCached --> End([End])
    ReturnEmpty --> End
    ReturnResults --> End
    
    style Start fill:#e3f2fd
    style End fill:#e8f5e8
    style InputValidation fill:#fff3e0
    style QueryPreprocess fill:#f3e5f5
    style EcommerceFilter fill:#e8f5e8
    style Ranking fill:#fff8e1
    style PackageResults fill:#fce4ec
```

## Query Understanding Layer Flow

```mermaid
flowchart TD
    Query[Raw Query Input] --> Clean[Basic Cleaning]
    Clean --> SpellCheck[Spell Correction]
    SpellCheck --> Synonym[Synonym Expansion]
    Synonym --> Attributes[Attribute Extraction]
    Attributes --> Intent[Intent Recognition]
    Intent --> ProcessedQuery[Processed Query Output]
    
    style Query fill:#e1f5fe
    style ProcessedQuery fill:#c8e6c9
    style Clean fill:#fff3e0
    style SpellCheck fill:#f3e5f5
    style Synonym fill:#e8f5e8
    style Attributes fill:#fff8e1
    style Intent fill:#fce4ec
```

## Multi-Source Retrieval Flow

```mermaid
flowchart TD
    Start[Start Retrieval] --> Priority1[Priority 1: Google Shopping API]
    Priority1 --> Success1{Success?}
    Success1 -->|Yes| Results1[Collect Results]
    Success1 -->|No| Priority2[Priority 2: Google Custom Search - Shopping]
    
    Results1 --> Check1{Enough Results?}
    Check1 -->|Yes| Return1[Return Results]
    Check1 -->|No| Priority2
    
    Priority2 --> Success2{Success?}
    Success2 -->|Yes| Results2[Collect Results]
    Success2 -->|No| Priority3[Priority 3: Google Custom Search - General]
    
    Results2 --> Check2{Enough Results?}
    Check2 -->|Yes| Return2[Return Results]
    Check2 -->|No| Priority3
    
    Priority3 --> Success3{Success?}
    Success3 -->|Yes| Results3[Collect Results]
    Success3 -->|No| Priority4[Priority 4: Google Custom Search - Indian]
    
    Results3 --> Check3{Enough Results?}
    Check3 -->|Yes| Return3[Return Results]
    Check3 -->|No| Priority4
    
    Priority4 --> Success4{Success?}
    Success4 -->|Yes| Results4[Collect Results]
    Success4 -->|No| Fallback[Fallback: Web Scraping]
    
    Results4 --> Check4{Enough Results?}
    Check4 -->|Yes| Return4[Return Results]
    Check4 -->|No| Fallback
    
    Fallback --> Results5[Collect Results]
    Results5 --> Return5[Return Results]
    
    Return1 --> End[End Retrieval]
    Return2 --> End
    Return3 --> End
    Return4 --> End
    Return5 --> End
    
    style Start fill:#e3f2fd
    style End fill:#e8f5e8
    style Priority1 fill:#fff3e0
    style Priority2 fill:#f3e5f5
    style Priority3 fill:#e8f5e8
    style Priority4 fill:#fff8e1
    style Fallback fill:#fce4ec
```

## E-commerce Filter Layer Flow

```mermaid
flowchart TD
    Candidates[Raw Candidates] --> DomainCheck[Domain Whitelisting]
    DomainCheck --> ValidDomain{Valid E-commerce Domain?}
    ValidDomain -->|No| Reject1[Reject]
    ValidDomain -->|Yes| ContentCheck[Content Analysis]
    
    ContentCheck --> ProductContent{Product-specific Content?}
    ProductContent -->|No| Reject2[Reject]
    ProductContent -->|Yes| StructuredCheck[Structured Data Check]
    
    StructuredCheck --> HasStructured{Has Structured Data?}
    HasStructured -->|No| Reject3[Reject]
    HasStructured -->|Yes| ProductChecks[Product Validation Checks]
    
    ProductChecks --> ValidProduct{Valid Product?}
    ValidProduct -->|No| Reject4[Reject]
    ValidProduct -->|Yes| Normalize[Normalize Product Data]
    
    Normalize --> Deduplicate[GTIN Deduplication]
    Deduplicate --> FilteredResults[Filtered Results]
    
    Reject1 --> End[End]
    Reject2 --> End
    Reject3 --> End
    Reject4 --> End
    FilteredResults --> End
    
    style Candidates fill:#e1f5fe
    style FilteredResults fill:#c8e6c9
    style DomainCheck fill:#fff3e0
    style ContentCheck fill:#f3e5f5
    style StructuredCheck fill:#e8f5e8
    style ProductChecks fill:#fff8e1
    style Normalize fill:#fce4ec
```

## Relevance Ranking Engine Flow

```mermaid
flowchart TD
    Products[Filtered Products] --> ScoreCalculation[Calculate Individual Scores]
    
    ScoreCalculation --> LexicalScore[Lexical Score 40%]
    LexicalScore --> TitleMatch[Title Match 50%]
    TitleMatch --> DescMatch[Description Match 30%]
    DescMatch --> BrandMatch[Brand Match 20%]
    
    ScoreCalculation --> SemanticScore[Semantic Score 30%]
    SemanticScore --> WordSimilarity[Word Similarity]
    WordSimilarity --> SynonymMatch[Synonym Matching]
    
    ScoreCalculation --> BusinessScore[Business Score 20%]
    BusinessScore --> PriceComp[Price Competitiveness]
    PriceComp --> Availability[Stock Availability]
    Availability --> UserRating[User Ratings]
    
    ScoreCalculation --> BehavioralScore[Behavioral Score 10%]
    BehavioralScore --> CTR[Click-through Rate]
    CTR --> Conversion[Conversion Rate]
    
    BrandMatch --> TotalScore[Calculate Total Score]
    SynonymMatch --> TotalScore
    UserRating --> TotalScore
    Conversion --> TotalScore
    
    TotalScore --> SortByScore[Sort by Total Score]
    SortByScore --> RankedResults[Ranked Results]
    
    style Products fill:#e1f5fe
    style RankedResults fill:#c8e6c9
    style ScoreCalculation fill:#fff3e0
    style LexicalScore fill:#f3e5f5
    style SemanticScore fill:#e8f5e8
    style BusinessScore fill:#fff8e1
    style BehavioralScore fill:#fce4ec
```

## Error Handling Flow

```mermaid
flowchart TD
    API[API Call] --> Success{Success?}
    Success -->|Yes| ProcessResults[Process Results]
    Success -->|No| ErrorType{Error Type?}
    
    ErrorType -->|Rate Limit| Retry[Retry with Backoff]
    ErrorType -->|Authentication| NextAPI[Try Next API]
    ErrorType -->|Network| Timeout[Handle Timeout]
    ErrorType -->|Data| ParseError[Handle Parse Error]
    
    Retry --> RetrySuccess{Retry Success?}
    RetrySuccess -->|Yes| ProcessResults
    RetrySuccess -->|No| NextAPI
    
    NextAPI --> NextAPISuccess{Next API Success?}
    NextAPISuccess -->|Yes| ProcessResults
    NextAPISuccess -->|No| Fallback[Use Fallback]
    
    Timeout --> TimeoutSuccess{Timeout Success?}
    TimeoutSuccess -->|Yes| ProcessResults
    TimeoutSuccess -->|No| NextAPI
    
    ParseError --> ParseSuccess{Parse Success?}
    ParseSuccess -->|Yes| ProcessResults
    ParseSuccess -->|No| NextAPI
    
    Fallback --> FallbackSuccess{Fallback Success?}
    FallbackSuccess -->|Yes| ProcessResults
    FallbackSuccess -->|No| EmptyResults[Return Empty Results]
    
    ProcessResults --> End[End]
    EmptyResults --> End
    
    style API fill:#e1f5fe
    style ProcessResults fill:#c8e6c9
    style ErrorType fill:#fff3e0
    style Retry fill:#f3e5f5
    style NextAPI fill:#e8f5e8
    style Fallback fill:#fff8e1
    style EmptyResults fill:#fce4ec
```

## Caching Strategy Flow

```mermaid
flowchart TD
    SearchRequest[Search Request] --> GenerateKey[Generate Cache Key]
    GenerateKey --> CheckCache{Cache Hit?}
    
    CheckCache -->|Yes| ValidTTL{TTL Valid?}
    CheckCache -->|No| ExecuteSearch[Execute Search]
    
    ValidTTL -->|Yes| ReturnCached[Return Cached Results]
    ValidTTL -->|No| RemoveCache[Remove from Cache]
    RemoveCache --> ExecuteSearch
    
    ExecuteSearch --> SearchSuccess{Search Success?}
    SearchSuccess -->|Yes| CacheResults[Cache Results]
    SearchSuccess -->|No| ReturnError[Return Error]
    
    CacheResults --> ReturnFresh[Return Fresh Results]
    
    ReturnCached --> End[End]
    ReturnFresh --> End
    ReturnError --> End
    
    style SearchRequest fill:#e1f5fe
    style ReturnCached fill:#c8e6c9
    style ReturnFresh fill:#c8e6c9
    style CheckCache fill:#fff3e0
    style ExecuteSearch fill:#f3e5f5
    style CacheResults fill:#e8f5e8
```

## Performance Optimization Flow

```mermaid
flowchart TD
    Start[Start Search] --> Parallel[Parallel API Calls]
    Parallel --> TimeoutCheck{Timeout Reached?}
    TimeoutCheck -->|Yes| EarlyTerminate[Early Termination]
    TimeoutCheck -->|No| MinResults{Min Results?}
    
    MinResults -->|Yes| StopAPIs[Stop API Calls]
    MinResults -->|No| ContinueAPIs[Continue API Calls]
    
    ContinueAPIs --> QualityCheck{Quality Threshold?}
    QualityCheck -->|Yes| StopAPIs
    QualityCheck -->|No| TimeoutCheck
    
    StopAPIs --> Deduplicate[Deduplicate Results]
    EarlyTerminate --> Deduplicate
    
    Deduplicate --> Rank[Rank Results]
    Rank --> ReturnTopN[Return Top N Results]
    
    style Start fill:#e1f5fe
    style ReturnTopN fill:#c8e6c9
    style Parallel fill:#fff3e0
    style EarlyTerminate fill:#f3e5f5
    style Deduplicate fill:#e8f5e8
    style Rank fill:#fff8e1
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph "Frontend Layer"
        A[SearchBar] --> B[SearchContext]
        B --> C[SearchResults]
    end
    
    subgraph "Backend Layer"
        D[Search Controller] --> E[Product Search Service]
        E --> F[Query Layer]
        E --> G[Retrieval Layer]
        E --> H[Filter Layer]
        E --> I[Ranking Engine]
    end
    
    subgraph "External APIs"
        J[Google Shopping API]
        K[Google Custom Search API]
        L[Web Scraping]
    end
    
    subgraph "Data Storage"
        M[Cache]
        N[MongoDB]
    end
    
    C --> D
    G --> J
    G --> K
    G --> L
    E --> M
    E --> N
    
    style A fill:#e3f2fd
    style C fill:#e3f2fd
    style E fill:#fff3e0
    style J fill:#f3e5f5
    style K fill:#f3e5f5
    style L fill:#f3e5f5
    style M fill:#e8f5e8
    style N fill:#e8f5e8
```

## Key Performance Indicators (KPIs)

```mermaid
graph TD
    subgraph "Search Performance"
        A[Response Time < 2s]
        B[Cache Hit Rate > 60%]
        C[API Success Rate > 95%]
    end
    
    subgraph "Result Quality"
        D[Relevance Score > 80%]
        E[E-commerce Filter Rate > 90%]
        F[Deduplication Rate > 85%]
    end
    
    subgraph "User Experience"
        G[Search Success Rate > 98%]
        H[Error Rate < 2%]
        I[User Satisfaction > 4.5/5]
    end
    
    style A fill:#c8e6c9
    style B fill:#c8e6c9
    style C fill:#c8e6c9
    style D fill:#fff3e0
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#f3e5f5
    style H fill:#f3e5f5
    style I fill:#f3e5f5
```

This flowchart documentation provides a comprehensive visual representation of our AI-powered product search algorithm, showing the step-by-step flow, decision points, error handling, and performance optimizations. Each diagram can be used for:

1. **Development Reference**: Understanding the algorithm flow
2. **Code Review**: Ensuring implementation matches design
3. **Debugging**: Identifying where issues occur
4. **Performance Analysis**: Understanding bottlenecks
5. **Team Communication**: Explaining the system to stakeholders 