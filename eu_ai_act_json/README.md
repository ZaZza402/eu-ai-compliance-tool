# EU AI Act - Structured JSON Files

This directory contains the EU Artificial Intelligence Act (Regulation (EU) 2024/1689) parsed into structured JSON files for easy programmatic access.

## File Structure

### Preamble and Introduction

- **00_preamble.json** - Contains all 180 recitals and 7 citations that provide context and reasoning for the regulation
- **01_enacting_terms.json** - The formal enacting clause

### Chapters (01-13)

Each chapter is saved as a separate JSON file following the pattern `{number}_chapter_{roman_numeral}.json`:

- **01_chapter_I.json** - GENERAL PROVISIONS (4 articles)
  - Article 1: Subject matter
  - Article 2: Scope
  - Article 3: Definitions
  - Article 4: AI literacy

- **02_chapter_II.json** - PROHIBITED AI PRACTICES (1 article)
  - Article 5: Prohibited AI practices

- **03_chapter_III.json** - HIGH-RISK AI SYSTEMS (5 sections, 44 articles)
  - Section 1: Classification of AI systems as high-risk
  - Section 2: Requirements for high-risk AI systems
  - Section 3: Obligations of providers and deployers of high-risk AI systems and other parties
  - Section 4: Notifying authorities and notified bodies
  - Section 5: Standards, conformity assessment, certificates, registration

- **04_chapter_IV.json** - TRANSPARENCY OBLIGATIONS FOR PROVIDERS AND DEPLOYERS OF CERTAIN AI SYSTEMS (1 article)
  - Article 50: Transparency obligations

- **05_chapter_V.json** - GENERAL-PURPOSE AI MODELS (4 sections, 6 articles)
  - Section 1: Classification rules
  - Section 2: Obligations for providers of general-purpose AI models
  - Section 3: Obligations for providers of general-purpose AI models with systemic risk
  - Section 4: Codes of practice

- **06_chapter_VI.json** - MEASURES IN SUPPORT OF INNOVATION (7 articles)
  - Covers AI regulatory sandboxes and innovation support

- **07_chapter_VII.json** - GOVERNANCE (2 sections, 7 articles)
  - Section 1: Governance at Union level
  - Section 2: National competent authorities and governance at national level

- **08_chapter_VIII.json** - EU DATABASE FOR HIGH-RISK AI SYSTEMS (1 article)
  - Article 71: EU database for high-risk AI systems

- **09_chapter_IX.json** - POST-MARKET MONITORING, INFORMATION SHARING AND MARKET SURVEILLANCE (5 sections, 23 articles)
  - Section 1: Post-market monitoring
  - Section 2: Sharing of information on incidents and malfunctioning
  - Section 3: Enforcement
  - Section 4: Remedies
  - Section 5: Supervision, investigation, enforcement and monitoring

- **10_chapter_X.json** - CODES OF CONDUCT AND GUIDELINES (2 articles)
  - Article 95: Codes of conduct for voluntary application
  - Article 96: Guidelines on implementation

- **11_chapter_XI.json** - DELEGATION OF POWER AND COMMITTEE PROCEDURE (2 articles)
  - Article 97: Exercise of the delegation
  - Article 98: Committee procedure

- **12_chapter_XII.json** - PENALTIES (3 articles)
  - Article 99: Penalties
  - Article 100: Administrative fines
  - Article 101: Administrative fines on Union institutions

- **13_chapter_XIII.json** - FINAL PROVISIONS (12 articles)
  - Articles 102-113 covering amendments, evaluation, entry into force

### Annexes

Each annex is saved as `annex_{roman_numeral}.json`:

- **annex_I.json** - Union harmonisation legislation
- **annex_II.json** - List of criminal offences
- **annex_III.json** - HIGH-RISK AI SYSTEMS (detailed list by use case area)
- **annex_IV.json** - Technical documentation requirements
- **annex_V.json** - EU declaration of conformity
- **annex_VI.json** - Conformity assessment procedures
- **annex_VII.json** - Conformity assessment based on quality management system
- **annex_VIII.json** - Information to be submitted for registration
- **annex_IX.json** - Information to be submitted for registration of testing in real-world conditions
- **annex_X.json** - Large-scale IT systems in the area of freedom, security and justice
- **annex_XI.json** - Technical documentation for providers of general-purpose AI models
- **annex_XII.json** - Transparency information for general-purpose AI models
- **annex_XIII.json** - Criteria for designation of general-purpose AI models with systemic risk

## JSON Structure

### Chapter Files

```json
{
  "id": "cpt_I",
  "chapter": "CHAPTER I",
  "title": "GENERAL PROVISIONS",
  "sections": [
    {
      "id": "cpt_III.sct_1",
      "section": "SECTION 1",
      "title": "Classification of AI systems as high-risk",
      "articles": [...]
    }
  ],
  "articles": [
    {
      "id": "art_1",
      "article": "Article 1",
      "title": "Subject matter",
      "content": {
        "paragraphs": [
          {
            "id": "001.001",
            "text": "1. The purpose of this Regulation..."
          }
        ],
        "full_text": "Combined text of all paragraphs..."
      }
    }
  ]
}
```

### Preamble File

```json
{
  "title": "Preamble",
  "citations": [
    {
      "citation": 1,
      "id": "cit_1",
      "text": "Having regard to..."
    }
  ],
  "recitals": [
    {
      "recital": 1,
      "id": "rct_1",
      "text": "The purpose of this Regulation..."
    }
  ]
}
```

### Annex Files

```json
{
  "id": "anx_III",
  "annex": "ANNEX III",
  "title": "HIGH-RISK AI SYSTEMS",
  "content": "Full text content..."
}
```

## Usage Examples

### Loading a Chapter

```python
import json

# Load Chapter III (High-Risk AI Systems)
with open('03_chapter_III.json', 'r', encoding='utf-8') as f:
    chapter3 = json.load(f)

# Access sections
for section in chapter3['sections']:
    print(f"Section: {section['title']}")
    for article in section['articles']:
        print(f"  - {article['article']}: {article['title']}")
```

### Searching for Specific Articles

```python
import json
import glob

def find_article(article_number):
    """Find an article across all chapters"""
    for filepath in glob.glob('*_chapter_*.json'):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Check direct articles
        for article in data.get('articles', []):
            if f"Article {article_number}" in article['article']:
                return article

        # Check articles in sections
        for section in data.get('sections', []):
            for article in section.get('articles', []):
                if f"Article {article_number}" in article['article']:
                    return article

    return None

# Example: Find Article 5
article5 = find_article(5)
if article5:
    print(f"{article5['article']}: {article5['title']}")
    print(article5['content']['full_text'][:200])
```

### Accessing Recitals

```python
import json

with open('00_preamble.json', 'r', encoding='utf-8') as f:
    preamble = json.load(f)

# Print all citations
print("Citations:")
for citation in preamble['citations']:
    print(f"{citation['citation']}. {citation['text']}")

# Access specific recital
recital_10 = next((r for r in preamble['recitals'] if r['recital'] == 10), None)
if recital_10:
    print(f"\nRecital 10:\n{recital_10['text']}")
```

## Document Information

- **Regulation Number**: (EU) 2024/1689
- **Title**: Laying down harmonised rules on artificial intelligence (Artificial Intelligence Act)
- **Published**: 12 July 2024
- **Entry into Force**: 1 August 2024
- **Application Timeline**:
  - Prohibited practices: 2 February 2025
  - General-purpose AI obligations: 2 August 2025
  - High-risk obligations: 2 August 2026

## Generation

These files were automatically generated from the official EU AI Act HTML document using the `parse_eu_ai_act.py` script.

To regenerate:

```bash
python parse_eu_ai_act.py
```

## License

The EU AI Act is official legislation of the European Union. This structured JSON representation is provided for informational and development purposes. Always refer to the official publication in the Official Journal of the European Union for legal purposes.
