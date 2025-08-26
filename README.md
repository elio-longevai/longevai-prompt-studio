#  LongevAI Prompt Studio 🚀

Welcome to the internal repository for the LongevAI Prompt Studio. This is a bespoke, in-house tool designed to streamline and standardize the creation of high-quality prompts for various AI tasks across the company. It replaces manual prompt crafting with a beautiful, efficient, and data-driven workflow.

---

## ✨ Key Features

*   **Beautiful Tile-Based Dashboard**: An elegant and intuitive main screen providing quick access to all available prompt generators.
*   **Dynamic Generator Pages**: Each tile leads to a dedicated page with a form that is dynamically rendered based on a central JSON configuration.
*   **Specialized Generators**: Includes pre-configured generators for common LongevAI tasks:
    *   **📧 E-mail Generator**: Crafts professional emails in LongevAI's HTML format.
    *   **📄 Proposal Generator**: A powerful dual-path generator for creating either high-level HTML overviews or detailed Markdown proposals from templates.
    *   **📊 Slide Generator**: Creates prompts for our AI Coder to modify slide deck codebases.
    *   **📝 Meeting Summarizer**: Generates prompts to create beautifully formatted meeting summaries.
*   **Data-Driven Configuration**: All generators, their inputs, and system prompts are managed through a single, easy-to-edit `tiles.json` file.
*   **Context-Aware Prompts**: Automatically includes a shared `longevai_context.txt` file and formats all user inputs with clean XML tags for maximum clarity for the AI.
*   **Simple Admin Dashboard**: A dedicated `/admin` page allows for easy editing of all generator configurations with a manual copy/paste update mechanism.
*   **Seamless Workflow**: One-click prompt copying, a confirmation toast, and a direct link to the target AI tool (AI Studio, Claude, etc.) make the process incredibly fast.

---

## 💻 Tech Stack

This project is built with a modern, performant, and developer-friendly stack:

| Category      | Technology                                                                                                    |
|---------------|---------------------------------------------------------------------------------------------------------------|
| **Framework**   | [Next.js 14+](https://nextjs.org/) (App Router)                                                              |
| **Language**    | [TypeScript](https://www.typescriptlang.org/)                                                                 |
| **Styling**     | [Tailwind CSS](https://tailwindcss.com/)                                                                        |
| **UI Components** | [Shadcn/ui](https://ui.shadcn.com/)                                                                           |
| **Animation**   | [Framer Motion](https://www.framer.com/motion/)                                                                 |
| **Icons**       | [Lucide React](https://lucide.dev/)                                                                             |

---

## 📂 Project Structure

The codebase is organized to be intuitive and easy to navigate. Here are the key directories:

```
longevai-prompt-studio/
├── public/
│   └── longevai_context.txt      # Client-side fetchable LAI context
├── src/
│   ├── app/
│   │   ├── [id]/page.tsx         # DYNAMIC page for individual generators
│   │   ├── admin/page.tsx        # The admin dashboard UI
│   │   ├── page.tsx              # The main tile-based homepage
│   │   └── layout.tsx            # Root layout with header
│   ├── components/
│   │   └── ui/                   # Reusable Shadcn UI components
│   ├── data/
│   │   ├── templates/            # Stores HTML and Markdown proposal templates
│   │   ├── longevai_context.txt  # Master copy of LAI context (not directly used by client)
│   │   └── tiles.json            # THE SINGLE SOURCE OF TRUTH for all generators
│   └── lib/
│       ├── templateLoader.ts     # Logic for loading proposal templates
│       └── utils.ts              # Utility functions (e.g., cn)
└── package.json                  # Project dependencies
```

---

## 🛠️ Getting Started

To get the Prompt Studio running on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd longevai-prompt-studio
    ```

2.  **Install dependencies:**
    This project uses `pnpm`, but you can use `npm` or `yarn` as well.
    ```bash
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```

4.  **Open the application:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser. You should see the Prompt Studio dashboard.

---

## 🔧 How to Modify a Generator

The entire application is designed to be easily configurable via the `tiles.json` file.

### 1. Edit `src/data/tiles.json`

This file is an array of "tile" objects. To modify a generator, find its object in the array. To add a new one, copy an existing object and modify its properties:

*   `id`: A unique, URL-friendly string (e.g., `"new-generator"`).
*   `title`: The display name on the tile.
*   `description`: The subtitle text on the tile.
*   `icon`: The name of a `lucide-react` icon (e.g., `"Presentation"`, `"Mail"`).
*   `system_prompt` / `system_prompts`: The core instruction for the AI. Use `system_prompts` for generators like the Proposal Generator that have multiple paths (`html`, `markdown`).
*   `inputs`: An array defining the form fields. Each input object has:
    *   `id`: The key for the form data and the XML tag name.
    *   `label`: The display label for the form field.
    *   `type`: Can be `"text"`, `"textarea"`, `"select"`, or `"document_upload"`.
    *   `path`: (For Proposal Generator only) Use `"html"`, `"markdown"`, or `"both"` to control when the input is shown.
    *   `options`: An array of strings, required for `type: "select"`.
    *   `required`: A boolean (`true`/`false`).
*   `output`: Defines the behavior of the confirmation toast.
    *   `copy_button_text`: Text for the main copy button.
    *   `link_button_text`: Text for the button in the toast.
    *   `url`: The URL the toast button links to.

### 2. Add Template Files (For Proposal Generator)

If you are adding a new HTML or Markdown proposal template:
1.  Add the new file (e.g., `new_client.html`) to `src/data/templates/`.
2.  Update the `templateLoader.ts` file in `src/lib/` to recognize and load your new template.
3.  Add the filename to the `options` array for the relevant `select` input in `tiles.json`.

### 3. Update Icons

If you add a new generator, make sure to add its corresponding `lucide-react` icon to the mapping in `src/app/page.tsx`.

---

## ⚙️ Using the Admin Dashboard

For quick, non-code edits, the Admin Dashboard is available at `/admin`.

1.  Navigate to `http://localhost:3000/admin`.
2.  Make any desired changes to the titles, descriptions, prompts, etc., in the UI.
3.  When you are done, click the **"Save Changes"** button at the bottom. This updates the application's state but **does not save the file**.
4.  A large JSON object will be displayed. Click the **"Copy JSON"** button.
5.  Open `src/data/tiles.json` in your code editor, select all text, and paste the copied JSON to overwrite it.
6.  Save the file and commit your changes.

This manual process ensures that all configuration changes are version-controlled in Git.