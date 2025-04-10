import { Message } from 'ai';

// Extend the Message type from the AI SDK to include parts
export interface ExtendedMessage extends Message {
  parts?: Array<
    | {
        type: 'text';
        text: string;
      }
    | {
        type: 'reasoning';
        details: Array<
          | {
              type: 'text';
              text: string;
            }
          | {
              type: 'redacted';
            }
        >;
      }
  >;
}