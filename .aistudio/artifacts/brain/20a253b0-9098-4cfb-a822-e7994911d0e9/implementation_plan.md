# Implementation Plan: Ghana Bank Analysis

Integrate a performance tracking system for major Ghanaian banks to help SMEs make informed decisions about their banking partners.

### User Review & Critical Decisions

- **Access Level**: This feature will be **publicly available** to all logged-in SMEs.
- **Data Governance**: Data will be stored in Firestore and manageable via the Admin Portal to ensure accuracy and freshness.
- **Key Performance Indicators (KPIs)**:
    - **CAR (Capital Adequacy Ratio)**: Measures financial stability and ability to absorb losses.
    - **NPL (Non-Performing Loans)**: Indicates credit risk and loan portfolio health.
    - **Total Assets & Market Share**: Represents scale and market dominance.
    - **Profitability & RoA**: Measures operational efficiency and earnings growth.

---

### 1. Overview & Core Concept

The "Ghana Bank Analysis" tool provides transparency into the banking sector. SMEs can view a "Health Score" for each major bank (GCB, Ecobank, Stanbic, Absa, etc.) based on regulatory and financial data.

**Key Value**:
- **Transparency**: Easily see which banks are most stable and SME-friendly.
- **Risk Mitigation**: Monitor NPL trends to avoid banks with high credit exposure.
- **Growth Identification**: Find banks with strong asset growth that may be more aggressive in lending.

---

### 2. User Experience & Visual Design

The bank analysis section will follow the **SaaS & Dashboard** design guidelines, prioritizing high-density data and clear comparative visualizations.

**Key User Flows:**
1. **Global Comparison**: A list view of all banks with sparklines for quick trend identification.
2. **Bank Detail View**: A deep dive into a specific bank's strengths (e.g., "High Liquidity") and weaknesses (e.g., "Rising NPLs").
3. **Admin Management**: A dedicated editor in the CMS to update quarterly bank reports.

**Visual Identity:**
- **Health Indicators**: Color-coded badges for CAR and NPL (Green for healthy, Amber for caution).
- **Charts**: Interactive bar charts for asset comparison and line charts for CAR/NPL trends.
- **Typography**: Tabular numerals for all financial figures.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Data Update Frequency**
    - *Chosen Approach*: Quarterly updates via the Admin CMS.
    - *Why*: Banking performance data is typically released quarterly by the Bank of Ghana and individual institutions.
- **Decision 2: Automated vs. Manual Scoring**
    - *Chosen Approach*: Admin sets the strength/weakness text; system calculates the numerical health index based on CAR/NPL ratios.
    - *Why*: Provides the flexibility for human insight (expert analysis) while maintaining data integrity.

---

### 4. Technical Architecture & Data Strategy

**Updated Data Model (`firebase-blueprint.json`):**
- **`BankMetric`**: Entity containing:
    - `name`: Bank name
    - `car`: Capital Adequacy Ratio (%)
    - `npl`: Non-Performing Loan ratio (%)
    - `totalAssets`: Value in GH₵
    - `marketShare`: Percentage (%)
    - `profitBeforeTax`: Value in GH₵
    - `roa`: Return on Assets (%)
    - `strengths`: Array of strings
    - `weaknesses`: Array of strings

**Security Strategy:**
- SMEs: `read` access only.
- Admins: Full CRUD access via `/admin/content`.

```drawio
┌───────────────────────────┐
│      Sidebar (New Link)    │
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│     Bank Analysis View    │
├─────────────┬─────────────┤
│ Comparison  │  Bank Card  │
│ Chart (Bar) │  (Metrics)  │
└─────────────┴─────────────┘
```
