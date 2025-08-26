# Proposal MyActiveAge: AI-Powered Longevity Engine

## **1. Executive Summary**

Following our detailed conversations, we created a proposal that outlines a phased plan to build the **MyActiveAge AI-Powered Longevity Engine**.

The vision is to develop a sophisticated AI **co-pilot** for your expert team.

We have streamlined the build into a modular **8 weeks Project Scope**. This plan prioritizes the modules with the highest immediate impact, beginning with the **AI Findings Generator** and immediately followed by the **AI Action Plan Generator**. This sequence delivers the core physician co-pilot first, automating the heavy lifting of drafting both the analysis and the corresponding personalized plan.

This will be followed by the two-part **Consult & Intake Recording AI**, designed to intelligently capture and structure the crucial data from client conversations.

This approach provides a clear, manageable path to launching your AI capabilities, delivering immediate ROI by solving key operational bottlenecks, and building a powerful, proprietary asset for MyActiveAge.

## **2. Guiding principles**

We identified these important core principles:

* **Human-in-the-Loop is Paramount:** Every AI-generated draft, from findings to action plans, is designed for physician review. The AI acts as an expert assistant, providing a robust first draft that your team will always have the final say on, ensuring quality, safety, and a personal touch.
* **Build a Compounding Asset:** Every module is designed to contribute to an **Intelligent Knowledge Base**. We will meticulously structure all generated data—from findings to consultation summaries—to ensure it enriches the AI's understanding, making each subsequent module more powerful and valuable with time. **We will begin building this foundational asset from day one of Module 1.**


* **Capture All Value:** We will automate the capture of critical information from consultations, turning unstructured conversations into structured, actionable data and fulfilling all mandatory `verslaglegging` (summary log) requirements.
* **Scale Hyper-Personalization:** We will move beyond generic advice by architecting an AI that leverages the rich knowledge base to personalize the very **content and tone within each action card**.

## **3. Project Scope: A Phased Roadmap**

We propose a modular development plan to build and launch the foundational AI engine, prioritized based on our strategic discussion to maximize immediate impact.

![image.png](Proposal_MyActiveAge_AI-Powered_Longevity_Engine-707da661-2aef-4a9e-bcc7-73e0f85d037f/8f85b6f2-c22f-44ae-8c0f-77432c8d3fcc.png "")

### 🧠 **Module 1: AI Findings Generator**

* **Goal:** To build the core AI that analyzes client data and automates the first draft of the "Findings" summary.
* **Estimated Duration:** **1 Week**

| **Feature** | **Description** |
| --- | --- |
| **AI Findings Generator** | Development of a rapid AI engine that synthesizes lab results, client profiles, and knowledge base principles to draft a clear, insightful summary for each health domain. |
| **Physician-in-the-Loop** | All AI-generated findings are presented in an intuitive interface for physician review, editing, and final approval before they are finalized for the client. |
| **Intelligent Knowledge Base** | All findings and physician refinements are structured and stored to enrich the core AI, preparing it for the Action Plan and subsequent modules. |

---

### 🎯 **Module 2: AI Action Plan Generator**

* **Goal:** To leverage the approved findings to create a deeply personalized and actionable client plan, based on a clear, collaborative model.
* **Estimated Duration:** **2 Weeks**

| **Feature** | **Description** |
| --- | --- |
| **Identify and Prioritize Interventions** | AI logic analyzes the approved findings and knowledge base to auto-identify and prioritize the most critical intervention tiles (e.g., Nutrition, Sleep) for the client's action plan. |
| **Personalized Content Generation** | The system will generate personalized titles, one-sentence summaries, and detailed content *within* each action tile, tailored to the client's data and goals. **MyActiveAge** provides the base content templates and guidance for personalization. |
| **Physician Review Flags** | Instead of ambiguous scores, the system will clearly flag AI-generated suggestions that are novel or deviate from standard protocols, ensuring your physicians can quickly focus their expert review where it's needed most. (IE a warning sign ⚠️) |

---

### 🎙️ **Module 3: AI Powered Consultation (Part 1)**

* **Goal:** To build a robust, secure, and user-friendly platform for capturing, transcribing, and processing client intake sessions and consultations.
* **Estimated Duration:** **2 Weeks**

| **Feature** | **Description** |
| --- | --- |
| **Recording & Upload** | Supports both live, in-person recording (via a single microphone) and secure upload of audio files or transcripts from online tools (e.g., Google Meet), providing full flexibility for your hybrid consultation model. |
| **AI-Powered Transcription (NL & EN)** | Utilizes best-in-class APIs to accurately transcribe sessions in both **Dutch and English**. |
| **AI Summary & Profile Updates** | Generates a concise summary of the consultation and analyzes the transcript to suggest updates to the client's profile (e.g., new habits, medications) for one-click physician approval. |
| **Intelligent Knowledge Base** | All transcribed text, summaries, and profile updates are intelligently structured and stored, capturing all relevant information for future use. |

---

### 🧩 **Module 4: AI Powered Consultation (Part 2)**

* **Goal:** To finalize the consultation platform by adding advanced version control, an editing suite, and integration with your existing systems.
* **Estimated Duration:** **1 Week**

| **Feature** | **Description** |
| --- | --- |
| **Manual & AI-Powered Editing Suite** | An intuitive interface for physicians to review and refine the AI-generated summary, with tools for both manual edits and AI-assisted rewriting. |
| **Document Version Management** | A robust system that tracks all changes to consultation summaries, allowing physicians to view and revert to previous versions as needed for compliance and review. |
| **EPD Integration &** **Direct Access from Platform** | Establishes a connection with your EPD to sync client profile data and push finalized summaries. Enables SSO for a fluid user experience from the main MyActiveAge platform. |

---

### 💬 **Module 5: The Longevity Assistant (Client-Facing)**

* **Goal:** To provide clients with an intelligent, 24/7 chatbot that acts as their personal guide, fully aware of their unique health data.
* **Estimated Duration:** **2 Weeks**

| **Feature** | **Description** |
| --- | --- |
| **Client-Specific Context** | The AI assistant is securely loaded with the individual client's approved findings and action plan, ensuring all answers are relevant and personalized. |
| **Context-Aware Q&A Agent** | An AI agent capable of answering client questions by referencing their personal data stored in the knowledge base. |
| **Client-Led Profile Updates via Chat** | The AI identifies relevant personal updates in a conversation (e.g., "I've started strength training") and stages this information for the **client** to save to their profile with one click. |

## **4. Acceptance Criteria & Definition of Done**

To ensure we are fully aligned on the deliverables for each module, we've outlined the Acceptance Criteria (AC) below. These criteria define what a "successfully completed" module looks like from a functional perspective, serving as our shared **Definition of Done (DoD)**.

The AC for Module 1 is outlined to provide clarity for our initial sprint. The criteria for subsequent modules (2-5) are also provided as a starting point and will be collaboratively refined and detailed during our kick-off meeting and weekly status updates as we gain a better understanding of your platform and workflows.

---

#### ✅ **Module 1: AI Findings Generator**

*A physician can review, edit, and approve an AI-generated draft, which then becomes visible to the client.*

* **Practitioner Experience:** As a Physician/Admin, I can:
  * Select a client and trigger the AI to generate a complete "Findings" draft based on their lab results and profile data.
  * View the AI-generated draft in a simple review interface.
  * Manually edit or use AI to edit the text and approve the final version.
* **Client Experience:**
  * Once approved by the physician, the finalized "Findings" are visible to the client within their platform dashboard, formatted as agreed.
* **System Function:**
  * The approved findings and identified physician expertise are successfully captured and structured in the knowledge base.
* **Clinical Validation:**
  * A dedicated working session will be held with your clinical expert (Diederik) to test and fine-tune the AI-generated findings, ensuring the output consistently aligns with your standards for quality and clinical relevance.

---

#### ✅ **Module 2: AI Action Plan Generator**

*The system uses approved findings and client data to generate personalized action cards with clear review flags for the physician.*

* **Practitioner Experience:** As a Physician/Admin, I can:
  * Trigger the AI to generate a draft "Action Plan" based on the approved findings and the client's profile information (e.g., goals, current lifestyle).
  * See the plan presented as a series of intervention cards (e.g., Nutrition, Sleep, Exercise).
  * See that the content *within* the cards (titles, descriptions) is personalized using the client's specific context.
  * Quickly identify suggestions the AI is less confident about, as they are clearly marked with a warning flag (⚠️) for focused review.
  * Edit, add, or remove cards before approving the final plan for the client.
* **Client Experience:**
  * The approved, personalized action plan is visible to the client in their dashboard.
* **Clinical Validation:**
  * The AI's logic for prioritizing interventions and personalizing content will be tested and refined in a working session to ensure it aligns with your strategic and clinical approach.

---

#### ✅ **Module 3: AI Powered Consultation (Part 1)**

*A session can be successfully captured and processed into a summary and suggested profile updates for review.*

* **Practitioner Experience:** As a Physician/Admin, I can:
  * Record audio from a live, in-person session directly within the consultation platform.
  * Upload an audio file or transcript from an online session (e.g., a Google Meet recording).
* **System Function & Output:** The system will automatically:
  * Accurately transcribe the session audio in both Dutch and English.
  * Generate a concise, structured summary of the key topics discussed, as per your desired output structure.
  * Analyze the transcript to identify and suggest specific updates to the client's profile (e.g., new medications, lifestyle changes), presented in a clear "review and approve" format.

---

#### ✅ **Module 4: AI Powered Consultation (Part 2)**

*A physician has a full suite of tools to refine, manage, and sync consultation summaries with existing systems.*

* **Practitioner Experience:** As a Physician/Admin, I can:
  * Manually edit the AI-generated summary text directly in the interface.
  * Use an AI-powered chat on the side to request specific revisions (e.g., "Make this section more concise") or ask questions.
  * View a history of all changes (version control) and revert to a previous version if needed.
* **System Integration:**
  * Finalized summaries and transcripts are successfully pushed to the EPD via the agreed-upon API connection.
  * Users can navigate seamlessly from the main MyActiveAge platform to the consultation tool via Single Sign-On (SSO).

---

#### ✅ **Module 5: The Longevity Assistant (Client-Facing)**

*A client can get safe, personalized answers about their plan and update their profile through an intelligent chat interface.*

* **Client Experience:** As a Client, I can:
  * Open a chat interface within my dashboard to ask questions about my approved findings and action plan.
  * Receive answers that are generated based *only* on my personal data and the approved knowledge base.
  * If I ask a question outside its scope (e.g., requests for new medical advice), the assistant politely declines to answer.
  * If I mention a personal update (e.g., "I've started strength training twice a week"), the assistant recognizes this and prompts me to confirm and save the update to my profile.
* **System Function:**
  * All chat histories are securely stored and correctly associated with each client for future reference.

## **5. Project Investment**

The list of prioritized modules with the duration and cost associated are listed in the table below.

| **Module** | **Description** | **Est. Duration** | **Cost** |
| --- | --- | --- | --- |
| **Module 1** | AI Findings Generator (Core Engine) | 1 Week | €2,500 |
| **Module 2** | AI Action Plan Generator (Personalization) | 2 Weeks | €5,000 |
| **Module 3** | Consult Recording AI (Part 1: Capture) | 2 Weeks | €5,000 |
| **Module 4** | Consult Recording AI (Part 2: Integration) | 1 Week | €2,500 |
| **Module 5** | The Longevity Assistant (Client-Facing AI) | 2 Weeks | €5,000 |

## **6. Future modules**

Once the core engine is live, we can expand its capabilities with these modules:

| **Future Module** | **Description** | **Est. Duration** |
| --- | --- | --- |
| **The Internal Team Assistant** | Enhances operational efficiency with an internal AI for your team. Features include scheduling assistance and a marketing content generator that analyzes anonymized data from the client chatbot to identify "hot topics" and common questions. | TBD |
| **Automated Action Plan Evolution** | A powerful future upgrade that analyzes full follow-up consultations to automatically suggest updates and evolutions to a client's existing action plan, keeping it current with their progress. | TBD |
| **AI-Powered Course Development** | A long-term opportunity to leverage the rich, structured knowledge base to assist in creating high-quality, data-driven content for your professional lifestyle courses. | TBD |
| **Learning from tickets** | Filling the knowledge base based on new tickets coming in, to answer client questions in the chatbot | TBD |

## **7. Next Steps**

1. **Review & Agreement:** Review and confirm/discuss the proposal.
2. **Contract & Invoice:** We will then provide the formal contract for signature and the initial invoice to begin work.
3. **Project Kick-off:** A formal meeting to align on details and commence development of Module 1.

## **8. Requirements to Get Started**

We are ready to begin immediately. To ensure the first one-week sprint is highly effective and delivers maximum value, we will need the following inputs *before* development on Module 1 begins:

**Module 1 Pre-Kickoff Requirements:**

* An initial setup of the **desired structure and sections** of the AI-generated "Findings" output.
* High-level specifications on the **required input data** (e.g., lab markers, profile fields) for each section of the findings.

**General Technical Requirements:**

* Access to a collection of **3 to 5 (anonymized) client profiles** & other input required for findings generation.
* Access to **technical documentation and relevant APIs** for your platform.
* Access to the **codebase** itself.