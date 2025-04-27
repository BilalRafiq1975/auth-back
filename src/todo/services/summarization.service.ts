import { Injectable, Logger } from '@nestjs/common';
import { pipeline } from '@xenova/transformers';

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

@Injectable()
export class SummarizationService {
  private summarizer: any;
  private readonly logger = new Logger(SummarizationService.name);
  private isInitializing = false;

  // Method to initialize the summarization model
  async initialize() {
    try {
      if (this.isInitializing) {
        this.logger.log('Model initialization already in progress...');
        return;
      }

      if (!this.summarizer) {
        this.isInitializing = true;
        this.logger.log('Initializing summarization model...');

        try {
          // Load the summarization model from Xenova's transformers library
          this.summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6');
          this.logger.log('Summarization model initialized successfully');
        } catch (modelError) {
          this.logger.error('Error loading summarization model:', modelError);
          throw new Error('Failed to load summarization model. Please try again later.');
        }
      }
    } catch (error) {
      this.logger.error('Error in initialize:', error);
      this.isInitializing = false;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  // Method to summarize todos with better formatting
  async summarizeTodos(todos: Todo[]): Promise<string> {
    try {
      if (!todos || todos.length === 0) {
        this.logger.log('No todos provided for summarization');
        return 'No todos to summarize.';
      }

      // Ensure the model is initialized before processing the summary
      await this.initialize();

      // Combine all todo descriptions into a single string
      const combinedText = todos
        .map(todo => `${todo.title}: ${todo.description}`)
        .join('. ');

      if (!combinedText.trim()) {
        this.logger.log('No content to summarize after combining todos');
        return 'No content to summarize.';
      }

      this.logger.log('Generating summary for todos...');
      const result = await this.summarizer(combinedText, {
        max_length: 200,  // Adjusted max length for better summaries
        min_length: 50,   // Adjusted min length for more comprehensive summaries
        do_sample: false,
      });

      if (!result || !result[0] || !result[0].summary_text) {
        throw new Error('Invalid summary result');
      }

      // Create a structured summary with categorized tasks
      const summaryText = result[0].summary_text;

      // Format the summary with sections: Pending, Completed, Key Focus Areas
      const formattedSummary = `
        📋 **Todo Summary**
        ─────────────────────────────

        **Pending Tasks:** 
        ${todos.filter(todo => !todo.completed).map(todo => `• ${todo.title}: ${todo.description}`).join('\n')}

        **Completed Tasks:**
        ${todos.filter(todo => todo.completed).map(todo => `• ${todo.title}: ${todo.description}`).join('\n')}

        **Key Focus Areas:**
        ${summaryText}

        ─────────────────────────────
        **Total Tasks:** ${todos.length} (${todos.filter(todo => !todo.completed).length} pending, ${todos.filter(todo => todo.completed).length} completed)
      `;

      this.logger.log('Summary generated successfully');
      return formattedSummary;
    } catch (error) {
      this.logger.error('Error in summarizeTodos:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }
}
