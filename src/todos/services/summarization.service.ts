import { Injectable, Logger } from '@nestjs/common';

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

@Injectable()
export class SummarizationService {
  private readonly logger = new Logger(SummarizationService.name);

  private extractKeyPhrases(todos: Todo[]): string[] {
    // Only filter out the most common words
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'
    ]);

    // Extract meaningful phrases from todos
    const phrases: string[] = [];
    
    todos.forEach(todo => {
      // Get the title and clean it
      const title = todo.title.toLowerCase().trim();
      
      // Skip if title is too short
      if (title.length < 3) return;

      // Split into words and clean
      const words = title
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.has(word));

      // If we have words, create a phrase
      if (words.length > 0) {
        const phrase = words.join(' ');
        if (!phrases.includes(phrase)) {
          phrases.push(phrase);
        }
      }
    });

    // If we don't have enough phrases, add some from descriptions
    if (phrases.length < 3) {
      todos.forEach(todo => {
        if (todo.description) {
          const descWords = todo.description
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !commonWords.has(word));

          if (descWords.length > 0) {
            const phrase = descWords.join(' ');
            if (!phrases.includes(phrase)) {
              phrases.push(phrase);
            }
          }
        }
      });
    }

    // Capitalize and return phrases
    return phrases.map(phrase => 
      phrase.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  }

  private generateSummary(todos: Todo[]): string {
    if (!todos || todos.length === 0) {
      return 'No todos to summarize.';
    }

    // Group todos by completion status
    const completed = todos.filter(todo => todo.completed);
    const pending = todos.filter(todo => !todo.completed);

    // Extract key phrases from pending todos
    const keyPhrases = this.extractKeyPhrases(pending);

    // Generate concise summary
    let summary = 'Progress Summary\n';
    summary += '----------------------------------------\n\n';
    
    // Progress Overview
    summary += `You have completed ${completed.length} out of ${todos.length} tasks.\n`;
    summary += `${pending.length} tasks remaining.\n\n`;

    // Main Points (from pending tasks)
    if (pending.length > 0) {
      summary += 'Main Focus Areas:\n';
      if (keyPhrases.length > 0) {
        keyPhrases.forEach(phrase => {
          summary += `• ${phrase}\n`;
        });
      } else {
        // If no phrases extracted, show pending task titles
        pending.forEach(todo => {
          summary += `• ${todo.title}\n`;
        });
      }
      summary += '\n';
    }

    // Quick Overview of Pending Tasks
    if (pending.length > 0) {
      summary += 'Pending Tasks:\n';
      pending.forEach(todo => {
        summary += `• ${todo.title}\n`;
      });
    }

    return summary;
  }

  async summarizeTodos(todos: Todo[]): Promise<string> {
    try {
      this.logger.log('Generating summary for todos...');
      const summary = this.generateSummary(todos);
      this.logger.log('Summary generated successfully');
      return summary;
    } catch (error) {
      this.logger.error('Error in summarizeTodos:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }
} 