import { readFileSync } from 'fs';
import { join } from 'path';

interface Concept {
  id: string;
  title: string;
  category: 'concept' | 'architecture' | 'decision';
  path: string;
  lastUpdated: string;
  relatedConcepts: string[];
  aiNotes?: string[];
}

interface DocumentationIndex {
  concepts: Concept[];
  lookup: Map<string, Concept>;
}

const DOCS_PATH = join(__dirname, '..', 'ai_docs');

export class AINotesManager {
  private index: DocumentationIndex;

  constructor() {
    this.index = this.loadIndex();
  }

  private loadIndex(): DocumentationIndex {
    const concepts: Concept[] = [
      {
        id: 'points-system',
        title: 'Points System',
        category: 'concept',
        path: join(DOCS_PATH, 'concepts', 'concept-points-system.md'),
        lastUpdated: '2024-04-01',
        relatedConcepts: ['student-management', 'keyboard-shortcuts', 'ui-components'],
      },
      {
        id: 'student-management',
        title: 'Student Management',
        category: 'concept',
        path: join(DOCS_PATH, 'concepts', 'concept-student-management.md'),
        lastUpdated: '2024-04-01',
        relatedConcepts: ['points-system', 'keyboard-shortcuts', 'tab-management'],
      },
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        category: 'concept',
        path: join(DOCS_PATH, 'concepts', 'concept-keyboard-shortcuts.md'),
        lastUpdated: '2024-04-01',
        relatedConcepts: ['student-management', 'points-system', 'ui-components'],
      },
      {
        id: 'vite-migration',
        title: 'Vite Migration',
        category: 'decision',
        path: join(DOCS_PATH, 'decisions', 'decision-vite-migration.md'),
        lastUpdated: '2024-04-01',
        relatedConcepts: ['build-system', 'development-workflow'],
      },
      {
        id: 'data-flow',
        title: 'Data Flow',
        category: 'architecture',
        path: join(DOCS_PATH, 'architecture', 'arch-data-flow.md'),
        lastUpdated: '2024-04-01',
        relatedConcepts: ['state-management', 'data-persistence', 'error-handling'],
      },
      {
        id: 'state-management',
        title: 'State Management',
        category: 'architecture',
        path: join(DOCS_PATH, 'architecture', 'arch-state-management.md'),
        lastUpdated: '2024-04-01',
        relatedConcepts: ['data-flow', 'data-persistence', 'error-handling'],
      },
    ];

    const lookup = new Map(
      concepts.map(concept => [concept.id, concept])
    );

    return { concepts, lookup };
  }

  getConcept(id: string): Concept | undefined {
    return this.index.lookup.get(id);
  }

  getRelatedConcepts(id: string): Concept[] {
    const concept = this.getConcept(id);
    if (!concept) return [];
    
    return concept.relatedConcepts
      .map(relatedId => this.getConcept(relatedId))
      .filter((c): c is Concept => c !== undefined);
  }

  getConceptsByCategory(category: Concept['category']): Concept[] {
    return this.index.concepts.filter(c => c.category === category);
  }

  getContent(path: string): string {
    try {
      return readFileSync(path, 'utf-8');
    } catch (error) {
      console.error(`Error reading file: ${path}`, error);
      return '';
    }
  }

  addAINote(conceptId: string, note: string): void {
    const concept = this.getConcept(conceptId);
    if (!concept) return;

    if (!concept.aiNotes) {
      concept.aiNotes = [];
    }

    concept.aiNotes.push(note);
    // In a real implementation, this would persist the changes
  }
}

// Export a singleton instance
export const aiNotes = new AINotesManager(); 