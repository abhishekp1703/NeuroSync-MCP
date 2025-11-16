import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

export interface FileOperationResult {
  success: boolean;
  filepath: string;
  message: string;
  content?: string;
}

/**
 * Write text content to a file
 */
export function writeToFile(filepath: string, text: string): FileOperationResult {
  try {
    // Ensure directory exists
    const dir = dirname(filepath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filepath, text, 'utf-8');

    return {
      success: true,
      filepath,
      message: `Successfully wrote to ${filepath}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      filepath,
      message: `Failed to write file: ${errorMessage}`,
    };
  }
}

/**
 * Read content from a file
 */
export function readFromFile(filepath: string): FileOperationResult {
  try {
    if (!existsSync(filepath)) {
      return {
        success: false,
        filepath,
        message: `File does not exist: ${filepath}`,
      };
    }

    const content = readFileSync(filepath, 'utf-8');

    return {
      success: true,
      filepath,
      message: `Successfully read ${filepath}`,
      content,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      filepath,
      message: `Failed to read file: ${errorMessage}`,
    };
  }
}

